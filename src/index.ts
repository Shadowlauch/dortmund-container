import 'reflect-metadata';
import fetch from 'node-fetch';
import {createConnection} from 'typeorm';
import {Container} from './entity/Container';
import {EmptyHistory} from './entity/EmptyHistory';
import {scheduleJob} from 'node-schedule';
import {config} from 'dotenv';
import * as waitPort from 'wait-port';

config();

(async () => {
  await waitPort({
    host: process.env.MYSQL_HOST,
    port: 3306
  });

  console.log('mysql found');

  createConnection({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    entities: [
      __dirname + '/entity/*.ts'
    ],
    synchronize: false,
  }).then(async connection => {
    console.log('db connected');

    const updateDB = async () => {
      const site: string = await fetch('https://www.edg.de/de/Entsorgungsdienstleistungen/Rein-damit/Info-Service.htm').then(r => r.text());

      // @ts-ignore
      const containers = site.matchAll(/depotContainer.push\(\['([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)'\]\);/g);

      let changedCount = 0;

      for await (const [, type, , lat, lon, emptyDateString, internalId, street] of containers) {
        let container = await connection.manager.findOne(Container, {where: {internalId, type}});

        if (container === undefined) {
          container = new Container();
        }

        container.type = type;
        container.internalId = internalId;
        container.lat = lat;
        container.lon = lon;
        container.street = street;
        await connection.manager.save(container);

        const lastEmpty = await connection.manager.findOne(EmptyHistory, {where: {container}, order: {date: 'DESC'}});
        const [day, month, year] = emptyDateString.split('.');
        const emptyDate = new Date(`${year}-${month}-${day}`);

        if (lastEmpty === undefined || lastEmpty.date < emptyDate) {
          const newEmptyHistory = new EmptyHistory();
          newEmptyHistory.date = emptyDate;
          newEmptyHistory.container = container;
          await connection.manager.save(newEmptyHistory);
          changedCount++;
        }
      }

      if (changedCount > 0) {
        console.log(`${changedCount} container were emptied since the last check`);
      }
    };


    scheduleJob('0 9 * * *', updateDB);
    await updateDB();
    console.log('init completed');

  }).catch(error => console.log(error));
})();


