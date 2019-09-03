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
import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { ActionSheetController } from 'ionic-angular';

import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { EventCaptureFormProvider } from '../../../../providers/event-capture-form/event-capture-form';
import { AppProvider } from '../../../../providers/app/app';

/**
 * Generated class for the EventConflictHandlerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'event-conflict-handler',
  templateUrl: 'event-conflict-handler.html'
})
export class EventConflictHandlerComponent implements OnInit, OnDestroy {
  @Input() eventConflictHandler: any;
  @Output() successDiscoveringEvents = new EventEmitter();
  @Output() successEventConflictHandle = new EventEmitter();

  eventsWithConflicts: any;
  isLoading: boolean;
  icons: any = {
    accept: 'assets/icon/tick.png',
    decline: 'assets/icon/cancel.png'
  };
  subscriptions: Subscription;
  constructor(
    private eventCaptureFormProvider: EventCaptureFormProvider,
    private appProvider: AppProvider,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.isLoading = true;
    this.subscriptions = new Subscription();
    this.eventsWithConflicts = [];
  }
  ngOnInit() {
    const {
      eventType,
      dataDimension,
      organisationUnitId,
      programId,
      programName,
      currentUser
    } = this.eventConflictHandler;
    if (
      organisationUnitId &&
      eventType &&
      dataDimension &&
      programName &&
      programId &&
      currentUser
    ) {
      this.discoveringEventsFromOnlineSever(
        programId,
        programName,
        organisationUnitId,
        dataDimension,
        eventType,
        currentUser
      );
    } else {
      this.isLoading = false;
    }
  }

  discoveringEventsFromOnlineSever(
    programId,
    programName,
    organisationUnitId,
    datadimension,
    eventType,
    currentUser
  ) {
    const action = 'accept';
    this.subscriptions.add(
      this.eventCaptureFormProvider
        .discoveringEventsFromServer(
          programId,
          programName,
          organisationUnitId,
          datadimension,
          eventType,
          currentUser
        )
        .subscribe(
          discoveredEvents => {
            console.log({ discoveredEvents });
            this.successDiscoveringEvents.emit({ status: true });
            const { events } = this.eventConflictHandler;
            const localEventIds = _.map(events, event => event.id);
            this.eventsWithConflicts = this.getEventsWithConflicts(
              discoveredEvents
            );
            const eventWithOutConflicts = _.filter(discoveredEvents, event => {
              return _.indexOf(localEventIds, event.id) === -1;
            });
            if (eventWithOutConflicts.length > 0) {
              const eventsToBeSaved = _.flatMapDeep([
                ...events,
                eventWithOutConflicts
              ]);
              const count = eventWithOutConflicts.length;
              this.appProvider.setTopNotification(
                `${count} events have been dicovered and applied into local storage`
              );
              this.applyingChnagesToEvents(eventsToBeSaved, action);
            }
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            console.log(JSON.stringify({ error }));
          }
        )
    );
  }

  getEventsWithConflicts(discoveredEvents) {
    let { events } = this.eventConflictHandler;
    events = this.getSanitizedOfflineEvents(events);
    const eventsWithConflicts = [];
    const localEventIds = _.map(events, event => event.id);
    // @todo checking using checksum
    let filteredDiscoveredEvents = _.filter(discoveredEvents, event => {
      return _.indexOf(localEventIds, event.id) > -1;
    });
    filteredDiscoveredEvents = this.getSanitizedOfflineEvents(
      filteredDiscoveredEvents
    );
    _.map(filteredDiscoveredEvents, event => {
      const offlineEvent = _.find(events, offlineEventObject => {
        return offlineEventObject.id === event.id;
      });
      if (offlineEvent && offlineEvent.id) {
        if (offlineEvent.syncStatus !== event.syncStatus) {
          eventsWithConflicts.push(event);
        } else if (offlineEvent.dataValues.length !== event.dataValues.length) {
          eventsWithConflicts.push(event);
        } else {
          const hasSameDataValues = this.getDataValuesConsistencyStatus(
            offlineEvent.dataValues,
            event.dataValues
          );
          if (!hasSameDataValues) {
            eventsWithConflicts.push(events);
          }
        }
      }
    });
    return eventsWithConflicts;
  }

  getSanitizedOfflineEvents(events) {
    events.forEach(event => {
      const dataValues = _.filter(event.dataValues, dataValue => {
        return dataValue && dataValue.value !== '';
      });
      event = { ...event, dataValues };
    });
    return events;
  }

  getDataValuesConsistencyStatus(offlineDataValues, onlineDataValues) {
    let hasSameDataValues = true;
    _.map(offlineDataValues, offlineDataValue => {
      if (
        offlineDataValue &&
        offlineDataValue.value &&
        offlineDataValue.dataElement
      ) {
        const matchDataValue = _.find(onlineDataValues, onlineDataValue => {
          return onlineDataValue.dataElement === offlineDataValue.dataElement;
        });
        if (!matchDataValue) {
          hasSameDataValues = false;
        }
        if (
          matchDataValue &&
          matchDataValue.value &&
          offlineDataValue.value &&
          offlineDataValue.value !== matchDataValue.value
        ) {
          hasSameDataValues = false;
        }
      }
    });
    return hasSameDataValues;
  }

  applyingChnagesToEvents(events, action) {
    this.successEventConflictHandle.emit({ events, action });
    this.eventsWithConflicts = [];
  }

  conflictHandlingAction(action) {
    if (action === 'accept') {
      const actionSheet = this.actionSheetCtrl.create({
        title:
          'You are about to replace offline data with data from the server, are you sure?',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              console.log({ eventsWithConflicts: this.eventsWithConflicts });
              this.applyingChnagesToEvents(this.eventsWithConflicts, action);
            }
          },
          {
            text: 'No',
            handler: () => {}
          }
        ]
      });
      actionSheet.present();
    }
    if (action === 'decline') {
      const actionSheet = this.actionSheetCtrl.create({
        title: 'You are about to discard data from server, are you sure?',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.applyingChnagesToEvents([], action);
            }
          },
          {
            text: 'No',
            handler: () => {}
          }
        ]
      });
      actionSheet.present();
    }
  }

  clearAllSubscriptions() {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

  ngOnDestroy() {
    this.clearAllSubscriptions();
    this.eventConflictHandler = null;
    this.isLoading = null;
    this.icons = null;
  }
}
