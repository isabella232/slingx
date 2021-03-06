/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command, flags } = require('@oclif/command')
const fs = require('fs')
const os = require('os')
const http = require('http')
const inquirer = require('inquirer')
const csvParser = require('csv-parser')
const needle = require('needle')
const utils = require('../helpers/utils')
class CreateCommand extends Command {
    async run() {
        let { hostname, username, password, csvPath } = await utils.getEnvironmentInfo()
        await this.importCSV(hostname, username, password, csvPath)
    }

    async importCSV(hostname, username, password, csvPath) {
        fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (row) => {
                let nodePath = row['parent'] + '/' + row['id']
                needle.post(hostname + nodePath, row, {
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
                    }
                }, (err, res) => {
                    if (err) {
                        console.error(err)
                    };
                    console.log(row['id'] + ' has been imported at ' + nodePath)
                    console.log(res.statusCode)
                });
            })
            .on('end', () => {
                console.log('CSV file successfully processed')
            });
    }

}

CreateCommand.description = `Create new Node(s) in a Sling repository`

module.exports = CreateCommand