/*
 *
 * Copyright 2015 HISP Tanzania
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 * @since 2015
 * @author Joseph Chingalo <profschingalo@gmail.com>
 *
 */
import { Injectable } from '@angular/core';
import { HttpClientProvider } from '../http-client/http-client';
import { Observable } from 'rxjs/Observable';
import { CurrentUser } from '../../models';
import { SqlLiteProvider } from '../sql-lite/sql-lite';

@Injectable()
export class OfflineCompletenessProvider {
  /**
   * @param  {HttpClientProvider} privatehttpClient
   * @param  {SqlLiteProvider} privatesqlLite
   */
  constructor(
    private httpClient: HttpClientProvider,
    private sqlLite: SqlLiteProvider
  ) {}

  /**
   * @param  {string} id
   * @param  {string} status
   * @param  {CurrentUser} currentUser
   * @returns Observable
   */
  getOfflineCompletenessesByIdAndStatus(
    id: string,
    status: string,
    currentUser: CurrentUser
  ): Observable<any> {
    const tableName = 'offlineCompleteness';
    return new Observable(observer => {
      const query = `SELECT * FROM ${tableName} WHERE id = '${id}' AND status = '${status}'`;
      this.sqlLite
        .getByUsingQuery(query, tableName, currentUser.currentDatabase)
        .subscribe(
          data => {
            observer.next(data);
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  /**
   * @param  {string} id
   * @param  {CurrentUser} currentUser
   * @returns Observable
   */
  getOfflineCompletenessesById(
    id: string,
    currentUser: CurrentUser
  ): Observable<any> {
    const tableName = 'offlineCompleteness';
    return new Observable(observer => {
      const query = `SELECT * FROM ${tableName} WHERE id = '${id}'`;
      this.sqlLite
        .getByUsingQuery(query, tableName, currentUser.currentDatabase)
        .subscribe(
          data => {
            observer.next(data);
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }
  /**
   * @param  {any} data
   * @param  {CurrentUser} currentUser
   * @returns Observable
   */

  savingOfflineCompleteness(
    data: any,
    currentUser: CurrentUser
  ): Observable<any> {
    const tableName = 'offlineCompleteness';
    return new Observable(observer => {
      this.sqlLite
        .insertBulkDataOnTable(tableName, data, currentUser.currentDatabase)
        .subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  offlineEventCompleteness(
    eventId: string,
    currentUser: CurrentUser
  ): Observable<any> {
    return new Observable(observer => {});
  }

  offlneEntryFormCompleteness(
    entryFormSelection: any,
    currentUser: CurrentUser
  ): Observable<any> {
    return new Observable(observer => {});
  }

  offlineEventUncompleteness(
    eventId: string,
    currentUser: CurrentUser
  ): Observable<any> {
    return new Observable(observer => {});
  }

  offlneEntryFormUncompleteness(
    entryFormSelection: any,
    currentUser: CurrentUser
  ): Observable<any> {
    return new Observable(observer => {});
  }
}
