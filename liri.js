require("dotenv").config();

const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const spotKey = require("./key.js");
const inquirer = require("inquirer");
const Spotify = require("node-spotify-api");

function runProgram() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What command would you like to use?",
        choices: ["find-a-concert", "spotify-it", "find-a-movie", "do-it"],
        name: "command"
      }
    ])
    .then(function(data) {
      switch (data.command) {
        case "find-a-concert":
          getConcert();
          break;
        case "spotify-it":
          getSong();
          break;
        case "find-a-movie":
          getMovie();
          break;
        case "do-it":
          doIt();
          break;
        default:
          console.log("404 command not found");
      }
    });
}

function getConcert() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter an artist",
        name: "artist"
      }
    ])
    .then(function(data) {
      if (data.artist === "") data.artist = "Daft Punk";

      axios
        .get(
          "https://rest.bandsintown.com/artists/" +
            data.artist +
            "/events?app_id=codingbootcamp"
        )
        .then(function(data) {
          if (!data) {
            console.log("404 not found");
          } else {
            let concerts = data.data;

            for (let i = 0; i < concerts.length; i++) {
              console.log("^~^~^~^~^~^~^~^~^~^~^~^~^~^");
              console.log(`The venue: ${concerts[i].venue.name}`);
              console.log(
                `The venue location: ${concerts[i].venue.city}, ${concerts[i].venue.country}`
              );
              console.log(
                `The concert date/time: ${moment(concerts[i].datetime).format(
                  "dddd, MMMM Do YYYY, h:mm a"
                )}`
              );
            }
          }

          restart();
        })
        .catch(function(error) {
          console.log(
            "~*~*~*~*~*~*~*~*~*~\n" + `${error}\n` + "~*~*~*~*~*~*~*~*~*~\n"
          );
          restart();
        });
    });
}
function getSong() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter a song title.",
        name: "song"
      }
    ])
    .then(function(data) {
      let song = data.song;
      
      if (song === "") song = "Stan";
      
      const spotify = new Spotify(spotKey.spotify);


      spotify
        .search({ type: "track", query: song, limit: 10 })

        .then(function(data) {
          let song = data.tracks.items;

          for (let i = 0; i < song.length; i++) {
            let theSong = song[i];

            console.log(`\nArtist(s): ${theSong.artists[0].name}`);
            console.log(`\nTrack: ${theSong.name}`);
            console.log(`\nAlbum: ${theSong.album.name}`);
            console.log(`\nPreview Link: ${theSong.preview_url}`);
          }
          restart();
        })
        .catch(function(error) {
          console.log(
            "~*~*~*~*~*~*~*~*~*~*~\n" + `${error}\n` + "~*~*~*~*~*~*~*~*~*~*~\n"
          );
          restart();
        });
    });
}

// this function will retrieve the movie information
function getMovie() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter a movie",
        name: "movie"
      }
    ])
    .then(function(data) {
      if (data.movie === "") data.movie = "Toy Story 2";

      axios
        .get("http://www.omdbapi.com/?t=" + data.movie +"&y=&plot=full&tomatoes=true&apikey=trilogy")
        .then(function(data) {
          let movie = data.data;

          console.log(`Movie: ${movie.Title}`);
          console.log(`Year: ${movie.Year}`);
          console.log(`Rating: ${movie.Ratings[0].Value}`);
          console.log(`Rotten Tomato Rating: ${movie.Ratings[1].Value}`);
          console.log(`Produced in: ${movie.Country}`);
          console.log(`Language(s): ${movie.Language}`);
          console.log(`Movie Plot: ${movie.Plot}`);
          console.log(`Movie Actors: ${movie.Actors}`);
          restart();
        })
        .catch(function(error) {
          console.log(
            "~*~*~*~*~*~*~*~*~*~*~\n" + `${error}\n` + "~*~*~*~*~*~*~*~*~*~*~\n"
          );
          restart();
        });
    });
}

function doIt() {
  fs.readFile("fill-in.txt", "utf8", function(error, data) {
    if (error) {
      console.log("Uhh... yeah I need to fix this");
    } else {
      data = data.split(", ");

      switch (data[0]) {
        case "find-a-concert":
          getConcert();
          break;
        case "spotify-it":
          getSong();
          break;
        case "find-a-movie":
          getMovie();
          break;
        case "do-it":
          console.log("This is why we cant have nice things");
          break;
        default:
          console.log(
            "~*~*~*~*~*~*~*~*~*~*~*~\n" +
              "404 not found\n" +
              "~*~*~*~*~*~*~*~*~*~*~*~\n"
          );
          restart();
      }
    }
  });
}

function restart() {
  console.log("~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~\n");
  inquirer
    .prompt([
      {
        type: "confirm",
        message: "Would you like to do another search?",
        name: "confirm",
        default: true
      }
    ])
    .then(function(response) {
      if (response.confirm) {
        runProgram();
      }
    });
}

runProgram();
