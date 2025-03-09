import mongoose, { Schema, Document, Model } from "mongoose";

interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: number;
  movieDetails: object;
  addedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: { type: Number, required: true },
    movieDetails: { type: Object, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Watchlist: Model<IWatchlist> =
  mongoose.models.Watchlist ||
  mongoose.model<IWatchlist>("Watchlist", WatchlistSchema);

export default Watchlist;
