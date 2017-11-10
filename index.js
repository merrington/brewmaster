const program = require('commander');
const chalk = require('chalk');
const axios = require('axios');

const logic = require('./logic');

program
  .version('1.0.0')
  .option('-e, --endpoint [endpoint]', 'API Endpoint')
  .option('-u, --userid [userid]', 'User ID')
  .option('-k, --key [key]', 'API Key')
  .option('-s, --season [season]', 'Season')
  .parse(process.argv);

const baseURL = program.endpoint || 'http://bevs.beer/api/v1';
const authHeaders = {
  'X-User-Id': program.userid,
  'X-Auth-Token': program.key
};
const seasonSlug = program.season;

const api = axios.create({
  baseURL,
  headers: authHeaders
});

//get the user info
console.log(chalk.blue('Getting user data...'));
api
  .get('/users/me')
  .then(async response => {
    console.log(chalk.blue('Done'));

    console.log(chalk.blue('Getting season data...'));
    const seasonResponse = await api.get(`/seasons/${seasonSlug}`);
    const seasonData = seasonResponse.data;
    console.log(chalk.blue('Done'));

    const data = response.data;
    const finalVote = {
      votes: []
    };

    console.log(chalk.blue('Calculating vote...'));
    //get the users's season info (num of votes)
    const userSeason = data.seasons.find(season => season.slug === seasonSlug);
    const shouldVote = logic.shouldVote(userSeason.votes);
    if (shouldVote || true) {
      const howManyVotes = logic.howManyVotes(userSeason.votes);

      finalVote.votes = logic.assignVotes({
        votes: howManyVotes,
        beers: seasonData.beers
      });
    } else {
      //choose a random beer to vote for
      finalVote.votes = [
        {
          beer: logic.getRandomBeer(seasonData.beers).id,
          positive: 1
        }
      ];
    }

    console.log(chalk.blue('Done'));

    console.log(chalk.blue('Sending vote...'));
    const voteResp = await api.post(`/seasons/${seasonSlug}/vote`, {
      votes: finalVote.votes
    });

    console.log(chalk.blue('Done'));
  })
  .catch(e => {
    console.error(e);
  });
