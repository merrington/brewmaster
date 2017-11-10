function getRandomBeer(beers) {
  const idx = Math.floor(Math.random() * beers.length);
  return beers[idx];
}

function addNegativeVote(votes, beers, num) {
  const beer = getRandomBeer(beers);
  const votingForBeer = votes.findIndex(votes => votes.beer === beer.id);

  if (votingForBeer === -1) {
    votes.push({
      beer: beer.id,
      negative: num
    });
  } else {
    votes[votingForBeer].negative += num;
  }
}

module.exports = {
  shouldVote(votes) {
    if (votes.positive < 5) {
      return false;
    }

    const length = votes.positive.length;

    let percentChance = (length - 5) * 10 + 30; // each vote > 5 add 10%, 5 votes = 30%
    percentChance = percentChance <= 80 ? percentChance : 80; //max 80% chance
    const rand = Math.random() * 100;

    return rand <= percentChance;
  },

  howManyVotes(userVotes) {
    const allIn = Math.random() * 100 <= 30; //30% chance to go all-in

    const votes = {
      positive: 0,
      negative: 0
    };

    if (allIn) {
      votes.positive = userVotes.positive;
      userVotes.positive = 0;
    } else {
      votes.positive = 5;
      userVotes.positive -= 5;

      const pos = userVotes.positive;
      for (let i = 0; i < pos; i++) {
        votes.positive += Math.round(Math.random());
      }
    }

    const useNegatives = Math.random() * 100 <= 30;
    if (useNegatives) {
      votes.negative = userVotes.negative;
    }

    return votes;
  },

  assignVotes({ votes, beers }) {
    const returnVotes = [];

    //get the positive beer
    const positiveBeer = getRandomBeer(beers);
    returnVotes.push({
      beer: positiveBeer.id,
      positive: votes.positive
    });

    //remove it from the list
    beers = beers.filter(beer => beer.id !== positiveBeer.id);

    //get the negative beers
    if (votes.negative) {
      const pairs = Math.floor(votes.negative / 2);
      const single = votes.negative % 2;

      for (let i = 0; i < pairs; i++) {
        addNegativeVote(returnVotes, beers, 2);
      }

      if (single) {
        addNegativeVote(returnVotes, beers, 1);
      }
    }

    return returnVotes;
  },

  getRandomBeer
};
