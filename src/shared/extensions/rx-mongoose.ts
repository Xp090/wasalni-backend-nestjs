import { Document, DocumentQuery, mquery, Model, Promise, SaveOptions } from 'mongoose';
import { from, Observable } from 'rxjs';
declare module 'mongoose' {

  interface mquery{
    toObservable() : Observable<any>
  }

  interface DocumentQuery<T, DocType extends Document, QueryHelpers = {}> {
    toObservable() : Observable<T>
  }

  interface Model<T extends Document, QueryHelpers = {}> {
    createAsObservable(docs: any[], callback?: (err: any, res: T[]) => void): Observable<T[]>;
    createAsObservable(docs: any[], options?: SaveOptions, callback?: (err: any, res: T[]) => void): Observable<T[]>;
    createAsObservable(...docs: any[]): Observable<T>;
    createAsObservable(...docsWithCallback: any[]) :Observable<T>
  }

  interface Document {
    saveAsObservable(options?: SaveOptions): Observable<this>;
  }
}

//This is where we do the actually implemention
mquery.prototype.toObservable = function() {
  var query = this;
  return from(query.exec())
}

Model.prototype.createAsObservable = function() {
   return from(this.create.apply(this,arguments))
}

// @ts-ignore
Document.prototype.saveAsObservable = function(options?: SaveOptions) {
 return from(this.save.apply(this,arguments))
}

export {} // This will turn this into a module. Don't forget it!
