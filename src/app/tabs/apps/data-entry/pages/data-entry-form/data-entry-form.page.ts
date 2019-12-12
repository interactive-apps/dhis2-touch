/*
 *
 * Copyright 2019 HISP Tanzania
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
 * @since 2019
 * @author Joseph Chingalo <profschingalo@gmail.com>
 *
 */

import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { State, getCurrentUserColorSettings } from '../../../../../store';
import {
  AppColorObject,
  CurrentEntrySelection,
  CurrentUser,
  EntryFormStatus
} from 'src/models';
import { CurrentEntrySelectionStorageService } from 'src/app/services/current-entry-selection-storage.service';
import { UserService } from 'src/app/services/user.service';
import { ToasterMessagesService } from 'src/app/services/toaster-messages.service';
import { isSelectedPeriodLockedForDataEntry } from 'src/helpers';
import { SettingsPage } from '../../../settings/settings.page';

@Component({
  selector: 'app-data-entry-form',
  templateUrl: './data-entry-form.page.html',
  styleUrls: ['./data-entry-form.page.scss']
})
export class DataEntryFormPage implements OnInit {
  colorSettings$: Observable<AppColorObject>;
  isLoading: boolean;
  currentEntrySelection: CurrentEntrySelection;
  isPeriodLocked: boolean;
  entryFormSyncStatus: EntryFormStatus;

  constructor(
    private store: Store<State>,
    private navController: NavController,
    private modalController: ModalController,
    private currentEntrySelectionStorageService: CurrentEntrySelectionStorageService,
    private userService: UserService,
    private toasterMessagesService: ToasterMessagesService
  ) {
    this.isLoading = true;
    this.isPeriodLocked = false;
    this.colorSettings$ = this.store.select(getCurrentUserColorSettings);
  }

  ngOnInit() {
    this.entryFormSyncStatus = this.entryFormSyncStatus || {
      synced: 0,
      notSynced: 0
    };
    this.discoveringCurrentUser();
  }

  getBackEntryFormSelection() {
    this.navController.back();
  }

  async discoveringCurrentUser() {
    const currentUser = await this.userService.getCurrentUser();
    await this.discoveringCurrentEntrySelection(currentUser);
    setTimeout(() => {
      this.isLoading = false;
    }, 100);
    try {
    } catch (error) {
      const message = `Error : ${JSON.stringify(error)}`;
      this.toasterMessagesService.showToasterMessage(message);
    }
  }

  async discoveringCurrentEntrySelection(currentUser: CurrentUser) {
    try {
      this.currentEntrySelection = await this.currentEntrySelectionStorageService.getCurrentEntrySelection(
        currentUser
      );
      const expiryDays = this.currentEntrySelection.selectedDataSet.expiryDays;
      const endDate = this.currentEntrySelection.selectedPeriod.endDate;
      this.isPeriodLocked = isSelectedPeriodLockedForDataEntry(
        expiryDays,
        endDate
      );
    } catch (error) {
      const message = `Error : ${JSON.stringify(error)}`;
      this.toasterMessagesService.showToasterMessage(message);
    }
  }

  async openSettingPage() {
    const modal = await this.modalController.create({
      component: SettingsPage,
      componentProps: {
        isModal: true
      },
      cssClass: 'inset-modal'
    });
    modal.present();
    await modal.onDidDismiss();
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 100);
  }

  async onEntryFormStatusChange() {
    console.log('On change of status');
  }
}