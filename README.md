# cloudflare-ip-monitor
Updates a list of DNS records with the current IP address

# Instructions

1. Copy `config.json.example` into `config.json`.
2. Add your credentials
    * `email`: your cloudflare email
    * `apiKey`: your cloudflare API key (https://dash.cloudflare.com/profile/api-tokens > Global API Key)
    * `zoneID`: the zone ID of your domain (you can find this in the dashboard of your domain, right bottom side)
    * `recordsToUpdate`: array of the domains to update, use the structure present in the original config file
3. Run `node cloudflare-ip-monitor -u` to update your IP. You can create a cronjob or something like that to automate this process.
4. Run `node cloudflare-ip-monitor -h` to see all the commands.