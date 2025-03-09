import mongoose, { Schema, Document, Model } from "mongoose";

interface IWatched extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: number;
  movieDetails: object;
  watchedDate: Date;
  rating?: number;
  review?: string;
  updatedAt: Date;
}

const WatchedSchema = new Schema<IWatched>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: { type: Number, required: true },
    movieDetails: { type: Object, required: true },
    watchedDate: { type: Date, default: Date.now },
    rating: { type: Number, min: 0, max: 10 },
    review: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Watched: Model<IWatched> =
  mongoose.models.Watched || mongoose.model<IWatched>("Watched", WatchedSchema);

export default Watched;
