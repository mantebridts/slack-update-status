# Slack Wifi Status

Set your Slack status to either :house_with_garden: or :coffee: (or some custom emoji) based on your location, which you can add via a custom Slackbot 'Earl'.

You list a set of locations, if you're at that place, then your status is set to

> :pick an emoji: My custom status

If you are at a location not on the list, then your status is set the location with name `Default`

> :coffee: At a coffee shop


## Setup

### 1. Setup local things
Download [the dist/local-cron-zip](https://github.com/mantebridts/slack-update-status/blob/master/dist/cron-1.0.1-osx.tar.gz).

### 2. Talk to the bot "Earl" on your Slack
He'll give you a link with a Slack-button. After that, you'll get a token, which you can use in the testing

### 3. Test your local setup
You can test your setup by running
```
bash cron.sh "your-secret-slack-token-here"
```

### 4. Talk to 'Earl' on your slack to add, remove and force statusses
Talk to the guy by using any of the following commands:
```
- add location: name_of_location;regex_of_location;status_message;status_emoji_name
- list locations
- where am i
```

### 5. Setup local cron job

Setup a cron job that runs every five minutes and runs `cron.sh`, use this command to use nano to edit the crontab-file:

```export VISUAL=nano; crontab -e```

and put this line in the file

```
*/5 * * * * cd /Users/yourname/path/to/code/slack-update-status && bash cron.sh "your-secret-slack-token-here"> /dev/null 2> /dev/null
```

### 6. Done
