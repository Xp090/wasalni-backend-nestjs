import * as mongoose from "mongoose";

import {RideRequestDocument, RideRequestSchema, RideRequestDocumentPopulated} from "./ride-request";
import { InjectModel } from '@nestjs/mongoose';

export enum TripStatus {
    DriverOnTheWayForPickUpPoint = 'DriverOnTheWayForPickUpPoint',
    DriverArrivedAtPickUpPoint = 'DriverOnTheWayForPickUpPoint',
    TripCanceledByRider = 'TripCanceledByRider',
    TripCanceledByDriver = 'TripCanceledByDriver',
    TripOngoing = 'TripOngoing',
    TripEnded = 'TripEnded'
}



export interface TripDocument extends mongoose.Document {
    rideRequest: RideRequestDocument | RideRequestDocumentPopulated
    tripStatus: TripStatus
}

export interface TripDocumentPopulated extends TripDocument {
    rideRequest: RideRequestDocumentPopulated
}

export const TripSchema = new mongoose.Schema({
    rideRequest: {
        type: RideRequestSchema,
    },
    tripStatus: {
        type: String,
        enum: Object.keys(TripStatus),
        default: TripStatus.DriverOnTheWayForPickUpPoint,
    }

}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret, options) => {
            delete ret._id;
            delete ret.rideRequest.requestsSent;
        },
        versionKey: false,
        virtuals: true
    }
});



export interface TripEconomy {
    cost: number;
}

export const InjectTripModel = () => InjectModel('Trip')
