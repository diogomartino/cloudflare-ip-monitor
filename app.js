const args = process.argv.slice(2);
const fs = require('fs');
const axios = require('axios');
const { exit } = require('process');

let config = null;

try {
    if (!fs.existsSync(__dirname + '/config.json') && fs.existsSync(__dirname + '/config.json.example')) {
        console.error('Please rename config.json.example to config.json and configure it.');
        exit();
    }
    config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));

    if (!config.email || !config.apiKey) {
        console.error('Wrong email or api key on config.json.');
        exit();
    }
} catch (error) {
    console.error('Invalid config.json', error);
    exit();
}

const cloudflare = require('cloudflare')({
    email: config.email,
    key: config.apiKey
});

const main = async () => {
    if (args.length > 0) {
        if (args.includes('-h')) {
            console.log('Updates a list of DNS records with the current IP address. Please check config.json.');
            console.log('    -h             \'Displays this help menu\'');
            console.log('    -d             \'Logs debug information\'');
            console.log('    -l             \'Lists all the available records on your account\'');
            console.log('    -u             \'Updates the given records with your current IP address\'');
        } else if (args.includes('-l')) {
            cloudflare.dnsRecords.browse(config.zoneID)
                .then((records) => {
                    console.log('Current DNS records:');
                    console.log('RECORD NAME | RECORD TYPE | RECORD CONTENT');
                    records.result.forEach(record => {
                        console.log(`   ${record.name} | ${record.type} | ${record.content}`);
                    });
                })
                .catch((error) => {
                    console.error('Error ocurred', error);
                });
        } else if (args.includes('-d')) {
            const ip = (await axios.get('https://api.ipify.org/?format=json')).data.ip;

            console.log(`My IP: ${ip}`);
            console.log(config);
        } else if (args.includes('-u')) {
            const ip = (await axios.get('https://api.ipify.org/?format=json')).data.ip;

            if (config.recordsToUpdate.length > 0) {
                config.recordsToUpdate.forEach(uRecord => {
                    cloudflare.dnsRecords.browse(config.zoneID)
                        .then((records) => {
                            records.result.forEach(record => {
                                if (uRecord.hostname === record.name && uRecord.type === record.type) {
                                    const editedObject = { ...record, content: ip };
                                    cloudflare.dnsRecords.edit(config.zoneID, record.id, editedObject)
                                        .then(() => {
                                            console.log(`Updated ${record.name} | ${record.type}`);
                                        })
                                        .catch((error) => {
                                            console.error('Error ocurred', error);
                                        });
                                }
                            });
                        })
                        .catch((error) => {
                            console.error('Error ocurred', error);
                        });
                })
            } else {
                console.log('No records present on config.json');
            }
        }
    } else {
        console.log('Use the -h param to display the available commands');
    }
}

main();