"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.App = void 0;
var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var TileModel_1 = require("./model/TileModel");
var TweetModel_1 = require("./model/TweetModel");
var UserModel_1 = require("./model/UserModel");
var MarketplaceModel_1 = require("./model/MarketplaceModel");
var GooglePassport_1 = require("./GooglePassport");
var passport = require("passport");
// Creates and configures an ExpressJS web server.
var App = /** @class */ (function () {
    //Run configuration methods on the Express instance.
    function App() {
        this.googlePassportObj = new GooglePassport_1["default"]();
        this.expressApp = express();
        this.middleware();
        this.routes();
        this.Tiles = new TileModel_1.TileModel();
        this.Tweets = new TweetModel_1.TweetModel();
        this.Users = new UserModel_1.UserModel();
        this.Marketplace = new MarketplaceModel_1.MarketplaceModel();
    }
    // Configure Express middleware.
    App.prototype.middleware = function () {
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
        this.expressApp.use(session({ secret: 'keyboard cat' }));
        this.expressApp.use(cookieParser());
        this.expressApp.use(passport.initialize());
        this.expressApp.use(passport.session());
        //CORS set up to allow access from Angular
        this.expressApp.use(function (req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
            next();
        });
    };
    //todo: update redirect address once Angular is deployed with Express
    App.prototype.validateAuth = function (req, res, next) {
        if (req.isAuthenticated()) {
            console.log("user is authenticated");
            return next();
        }
        //Not authenticated at this point, redirect them back to the original page
        console.log("user not authenticated");
        res.redirect('/#');
    };
    App.prototype.logoutUser = function (req, res, next) {
        console.log('logging user out');
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            ;
            res.redirect('/');
        });
        return next();
    };
    App.prototype.saveUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.Users
                    .model
                    .create({ ssoID: this.googlePassportObj.userId,
                    token: this.googlePassportObj.userToken,
                    displayName: this.googlePassportObj.userDisplayname,
                    favoriteList: [4573, 1352]
                }, function (err) { if (err) {
                    console.log("Possible duplicate tile! Tile creation failed!");
                }
                else
                    console.log('tile creation succeeded'); });
                return [2 /*return*/];
            });
        });
    };
    // Configure API endpoints.
    App.prototype.routes = function () {
        var _this = this;
        var router = express.Router();
        //SSO set up
        router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
        //google callback route
        router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/', failureMessage: true }), function (req, res) {
            console.log("successfully authenticated user and returned to callback page.");
            console.log("redirecting to /#");
            console.log(_this.googlePassportObj.userDisplayname);
            _this.saveUser();
            res.redirect('/#/profile');
        });
        router.get("/auth/user/info", this.validateAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('type of req ' + typeof (req));
                        console.log(req.user.id);
                        console.log('sending back user profile');
                        return [4 /*yield*/, this.Users.retrieveUserById({ ssoID: req.user.id }, res)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        router.get("/auth/user/loggedIn", function (req, res) {
            if (req.user) {
                console.log('user logged in');
                res.send(true);
            }
            else {
                console.log('user not logged in');
                res.send(false);
            }
        });
        router["delete"]('/auth/user/logout', this.validateAuth, function (req, res, next) {
            req.logout(function (err) {
                if (err) {
                    console.log('experienced internal failure');
                    res.status(400);
                    res.send(false);
                }
                ;
                console.log('logged out. Redirecting back to home page');
                res.send(true);
            });
        });
        //add the authentication here
        router.put("/app/user/favoritesList", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, estateId;
            return __generator(this, function (_a) {
                try {
                    id = req.user.id;
                    estateId = req.body.estateID;
                    console.log("Estate ID: " + estateId);
                    this.Users.addToFavoriteListById({ ssoID: id }, res, estateId);
                }
                catch (err) {
                    console.log('internal server failure:' + err);
                }
                return [2 /*return*/];
            });
        }); });
        //add the authentication here
        router.get("/app/user/:id/favoritesList", this.validateAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, favoritesList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        console.log("Query for favorites list of user id: " + id);
                        return [4 /*yield*/, this.Users.retrieveFavoriteEstates(id, res)];
                    case 1:
                        favoritesList = _a.sent();
                        res.send(favoritesList);
                        return [2 /*return*/];
                }
            });
        }); });
        router.get("/app/tile", function (req, res) {
            if (req.url.includes("?")) {
                var xCor = parseInt(req.query.x);
                var yCor = parseInt(req.query.y);
                var id = "".concat(xCor, ",").concat(yCor);
                console.log("Query single tile with coordinates: (".concat(xCor, ", ").concat(yCor, ")"));
                _this.Tiles.retrieveTileById(res, { tileId: id });
            }
            else {
                res.status(400);
                res.send("Please provide tile coordinates (x, y)");
            }
        });
        // get request for all tiles filtered by distinct estate ID
        router.get("/app/allTiles", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var tilesList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Query for all tiles");
                        return [4 /*yield*/, this.Tiles.retrieveAllTiles()];
                    case 1:
                        tilesList = _a.sent();
                        res.send(tilesList);
                        return [2 /*return*/];
                }
            });
        }); });
        router.get("/app/tile/estate/:id", function (req, res) {
            var id = parseInt(req.params.id);
            console.log("Query for all tiles in estate " + id);
            _this.Tiles.retrieveAllTilesInEstate(res, { estateId: id });
        });
        router.get("/app/tile/type/:typeValue", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var typeValue, tileList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        typeValue = req.params.typeValue;
                        console.log("Query for a tile with type: " + typeValue);
                        return [4 /*yield*/, this.Tiles.retrieveTilesOfSpecificType({ type: typeValue })];
                    case 1:
                        tileList = _a.sent();
                        res.json(tileList);
                        return [2 /*return*/];
                }
            });
        }); });
        router.get("/app/estates/type/:typeValue", function (req, res) {
            var typeValue = req.params.typeValue;
            console.log("Query for unique estates that are have type=" + typeValue);
            _this.Tiles.retrieveEstateIdsOfSpecificType(res, { type: typeValue });
        });
        router.get("/app/tweets", function (req, res) {
            console.log("Query for all tweets");
            _this.Tweets.retrieveAllTweets(res);
        });
        // get request for all sales for the marketplace of metaverses
        router.get("/app/marketplace/allSales", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var marketplaceSales;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Query for all sales in marketplace");
                        return [4 /*yield*/, this.Marketplace.retrieveAllSales()];
                    case 1:
                        marketplaceSales = _a.sent();
                        res.send(marketplaceSales);
                        return [2 /*return*/];
                }
            });
        }); });
        // get request for sales data for a given metaverse
        router.get("/app/marketplace/sale/:metaverse", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var metaverse, marketplaceList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metaverse = req.params.metaverse;
                        console.log("Query for sales in the metaverse");
                        return [4 /*yield*/, this.Marketplace.retrieveSaleByMetaverse(metaverse)];
                    case 1:
                        marketplaceList = _a.sent();
                        res.send(marketplaceList);
                        return [2 /*return*/];
                }
            });
        }); });
        // Internal post to add new tiles from the decentraland api and update our tiles DB 
        router.post("/app/tiles", function (req, res, next) {
            // Verify API key in header before processing the request
            if (req.headers["api-key"] == null) {
                var message = "Missing required authorization header: api-key";
                console.log(message);
                res.status(400);
                res.send(message);
                return;
            }
            // Verify API key is correct
            if (parseInt(req.headers["api-key"].toString()) != App.API_KEY) {
                var message = "Unauthorized request to ".concat(req.url, ", please check the api-key header.");
                console.log(message);
                res.status(401);
                res.send(message);
                return;
            }
            //Do a get call to metaverse
            var request = require("request");
            var maxResults = 10000;
            var counter = 0;
            var model = _this.Tiles.model; //alias to be used in the callback, scope issue
            request("https://api.decentraland.org/v2/tiles?include=id,type,updatedAt,name,owner,estateId,tokenId,price", function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var result = JSON.parse(body).data;
                    for (var tileId in result) {
                        var newEntry = JSON.parse(JSON.stringify(result[tileId])); //copy data to a new variable
                        newEntry._id = tileId; // set our db id to the decentraland id
                        newEntry.tileId = tileId; // set tileID to the decentraland id
                        //Put each item in the DB0
                        model.create(newEntry, function (err) {
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
                }
                else {
                    console.log("Failed to fetch data from external server.");
                    res.send("Update failed");
                }
            });
        });
        this.expressApp.use("/", router);
        this.expressApp.use("/app/json/", express.static(__dirname + "/app/json"));
        this.expressApp.use("/images", express.static(__dirname + "/img"));
        this.expressApp.use("/", express.static(__dirname + "/dist/meta-detector-app"));
    };
    App.API_KEY = 123;
    return App;
}());
exports.App = App;
