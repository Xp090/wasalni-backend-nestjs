import { DBModel } from './collections';
import { InjectModel } from '@nestjs/mongoose';

export const InjectDBModel = (modelName :DBModel) => InjectModel(modelName)
