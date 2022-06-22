import * as express from "express";
import * as bodyParser from "body-parser";
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as crypto from "crypto";
import { TileModel } from "./model/TileModel";
import { TweetModel } from "./model/TweetModel";
import { UserModel } from "./model/UserModel";
import { MarketplaceModel } from "./model/MarketplaceModel";

import GooglePassportObj from './GooglePassport';
import * as passport from 'passport';
// Creates and configures an ExpressJS web server.
class App {
  // ref to Express instance
  public expressApp: express.Application;
  public Tiles: TileModel;
  public Tweets: TweetModel;
  public Users: UserModel;
  public Marketplace: MarketplaceModel;
  private static API_KEY: number = 123;
  private googlePassportObj:GooglePassportObj;

  //Run configuration methods on the Express instance.
  constructor() {
    this.googlePassportObj = new GooglePassportObj();

    this.expressApp = express();
    this.middleware();
    this.routes();
    this.Tiles = new TileModel();
    this.Tweets = new TweetModel();
    this.Users = new UserModel();
    this.Marketplace = new MarketplaceModel();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: false }));
    this.expressApp.use(session({ secret: 'keyboard cat' }));
    this.expressApp.use(cookieParser());
    this.expressApp.use(passport.initialize());
    this.expressApp.use(passport.session());

    //CORS set up to allow access from Angular
    this.expressApp.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
      );
      next();
    });
  }

  //todo: update redirect address once Angular is deployed with Express
  private validateAuth(req, res, next): void {
    if (req.isAuthenticated()) {
      console.log("user is authenticated"); return next(); 
    }
    //Not authenticated at this point, redirect them back to the original page
    console.log("user not authenticated");
    res.redirect('/#');
  }

  protected logoutUser(req, res, next): void{
      console.log('logging user out');
      req.logout((err) => {
        if(err) { return next(err)};
        res.redirect('/')
      });
      return next();
  }

  private async saveUser() {
    this.Users
          .model
          .create({ssoID: this.googlePassportObj.userId,
                  token: this.googlePassportObj.userToken,
                  displayName: this.googlePassportObj.userDisplayname,
                  favoriteList: [4573, 1352]
                  }, 
                  (err) => { if (err) { console.log("Possible duplicate tile! Tile creation failed!");} else console.log('tile creation succeeded')});
  }

  // Configure API endpoints.
  private routes(): void {
    let router = express.Router();

    //SSO set up
    router.get('/auth/google', 
              passport.authenticate('google', {scope: ['profile']}));

    //google callback route
    router.get('/auth/google/callback', 
      passport.authenticate('google', 
        { failureRedirect: '/', failureMessage: true}
      ),
      (req, res) => {
        console.log("successfully authenticated user and returned to callback page.");
        console.log("redirecting to /#");
        console.log(this.googlePassportObj.userDisplayname);
        this.saveUser();
        res.redirect('/#/profile');
      }
    );

    router.get("/auth/user/info", this.validateAuth, async (req:any, res) => {
      console.log('type of req ' + typeof(req));
      console.log(req.user.id);
      console.log('sending back user profile');
      await this.Users.retrieveUserById({ssoID: req.user.id}, res);
    })

    router.get("/auth/user/loggedIn", (req:any, res) => {
      if(req.user){
        console.log('user logged in');
        res.send(true);
      } else {
        console.log('user not logged in');
        res.send(false);
      }
    })

    router.delete('/auth/user/logout', this.validateAuth, function(req:any, res, next){
      req.logout((err) => {
        if(err) {
          console.log('experienced internal failure')
          res.status(400);
          res.send(false);
        };

        console.log('logged out. Redirecting back to home page');
        res.send(true);
      });
    });

    //add the authentication here
    router.put("/app/user/favoritesList", async (req:any, res) => {

      try{
        var id = req.user.id;
        let estateId:Number = req.body.estateID;
        console.log("Estate ID: " + estateId);
        this.Users.addToFavoriteListById({ssoID: id}, res, estateId);
      }catch(err){
        console.log('internal server failure:' + err);
      } 
    });

    //add the authentication here
    router.get("/app/user/:id/favoritesList", this.validateAuth, async (req, res) => {
      var id = req.params.id;
      console.log("Query for favorites list of user id: " + id);
      let favoritesList = await this.Users.retrieveFavoriteEstates(id, res);
      res.send(favoritesList);
    });

    router.get("/app/tile", (req, res) => {
      if (req.url.includes("?")) {
        var xCor = parseInt(req.query.x);
        var yCor = parseInt(req.query.y);
        var id = `${xCor},${yCor}`;
        console.log(`Query single tile with coordinates: (${xCor}, ${yCor})`);
        this.Tiles.retrieveTileById(res, { tileId: id });
      } else {
        res.status(400);
        res.send("Please provide tile coordinates (x, y)");
      }
    });

    // get request for all tiles filtered by distinct estate ID
    router.get("/app/allTiles", async (req, res) => {
      console.log("Query for all tiles");
      let tilesList = await this.Tiles.retrieveAllTiles();
      res.send(tilesList);
    });

    router.get("/app/tile/estate/:id", (req, res) => {
      var id = parseInt(req.params.id);
      console.log("Query for all tiles in estate " + id);
      this.Tiles.retrieveAllTilesInEstate(res, { estateId: id });
    });

    router.get("/app/tile/type/:typeValue", async (req, res) => {
      var typeValue = req.params.typeValue;
      console.log("Query for a tile with type: " + typeValue);
      let tileList = await this.Tiles.retrieveTilesOfSpecificType({ type: typeValue });
      res.json(tileList);
    });

    router.get("/app/estates/type/:typeValue", (req, res) => {
      var typeValue = req.params.typeValue;
      console.log("Query for unique estates that are have type=" + typeValue);
      this.Tiles.retrieveEstateIdsOfSpecificType(res, { type: typeValue });
    });

    router.get("/app/tweets", (req, res) => {
      console.log("Query for all tweets");
      this.Tweets.retrieveAllTweets(res);
    });


    // get request for all sales for the marketplace of metaverses
    router.get("/app/marketplace/allSales", async (req, res) => {
      console.log("Query for all sales in marketplace");
      let marketplaceSales = await this.Marketplace.retrieveAllSales();
     
      res.send(marketplaceSales);
    });

    // Internal post to add new tiles from the decentraland api and update our tiles DB 
    router.post("/app/tiles", (req, res, next) => {
      // Verify API key in header before processing the request
      if (req.headers["api-key"] == null) {
        const message = "Missing required authorization header: api-key";
        console.log(message);
        res.status(400);
        res.send(message);
        return;
      }

      // Verify API key is correct
      if (parseInt(req.headers["api-key"].toString()) != App.API_KEY) {
        const message = `Unauthorized request to ${req.url}, please check the api-key header.`;
        console.log(message);
        res.status(401);
        res.send(message);
        return;
      }

      //Do a get call to metaverse
      const request = require("request");
      let maxResults = 10000;
      let counter = 0;

      let model = this.Tiles.model; //alias to be used in the callback, scope issue
      request(
        "https://api.decentraland.org/v2/tiles?include=id,type,updatedAt,name,owner,estateId,tokenId,price",
        (err, response, body) => {
          if (!err && response.statusCode == 200) {
            let result = JSON.parse(body).data;
            for (var tileId in result) {
              let newEntry = JSON.parse(JSON.stringify(result[tileId])); //copy data to a new variable
              newEntry._id = tileId; // set our db id to the decentraland id
              newEntry.tileId = tileId; // set tileID to the decentraland id

              //Put each item in the DB0
              model.create(newEntry, (err) => {
                if (err) {
                  console.log("Possible duplicate tile! Tile creation failed!");
                }
              });
              //Only storing 1 item for now, but eventually we would want to do a real update on every single item
              //break;
              counter++;
              if (counter == maxResults) {
                break;
              }
            }
            res.send("New items added");
          } else {
            console.log("Failed to fetch data from external server.");
            res.send("Update failed");
          }
        }
      );
    });

    this.expressApp.use("/", router);

    this.expressApp.use("/app/json/", express.static(__dirname + "/app/json"));
    this.expressApp.use("/images", express.static(__dirname + "/img"));
    this.expressApp.use("/", express.static(__dirname + "/dist/meta-detector-app"));
  }
}

export { App };
