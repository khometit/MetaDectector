import Mongoose = require("mongoose");

class DataAccess {
  static mongooseInstance: any;
  static mongooseConnection: Mongoose.Connection;
  // static DB_CONNECTION_STRING: string =
  //   "mongodb+srv://adminUser:SaasMetaDetector2022@metadetector-cluster.ks3os.mongodb.net/metaDetector?retryWrites=true&w=majority";
  static DB_CONNECTION_STRING: string = "mongodb://dbAdmin:test@localhost:3000/metaverseData?authSource=admin";

  constructor() {
    DataAccess.connect();
  }

  static connect(): Mongoose.Connection {
    if (this.mongooseInstance) return this.mongooseInstance;

    this.mongooseConnection = Mongoose.connection;
    this.mongooseConnection.on("open", () => {
      console.log("Connected to mongodb.");
    });

    this.mongooseInstance = Mongoose.connect(this.DB_CONNECTION_STRING);
    return this.mongooseInstance;
  }
}
DataAccess.connect();
export { DataAccess };
