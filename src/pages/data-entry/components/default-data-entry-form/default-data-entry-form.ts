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
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';

/**
 * Generated class for the DefaultDataEntryFormComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'default-data-entry-form',
  templateUrl: 'default-data-entry-form.html'
})
export class DefaultDataEntryFormComponent implements OnInit, OnChanges {
  @Input() entryFormSections;
  @Input() entryFormType: string;
  @Input() pager;
  @Input() dataValuesSavingStatusClass;
  @Input() currentUser;
  @Input() dataValuesObject;
  @Input() dataSetsCompletenessInfo;
  @Input() isDataSetCompleted: boolean;
  @Input() isDataSetCompletenessProcessRunning: boolean;
  @Input() icons;
  @Input() isPeriodLocked: boolean;
  @Input() isValidationProcessRunning: boolean;

  @Output() onChange = new EventEmitter();
  @Output() onSectionListOpen = new EventEmitter();
  @Output() onViewUserCompletenessInformation = new EventEmitter();
  @Output() onPaginationChange = new EventEmitter();
  @Output() onUpdateDataSetCompleteness = new EventEmitter();
  @Output() validatingEntryForm = new EventEmitter();

  lockingFieldStatus: boolean;

  constructor() {}

  ngOnInit() {
    this.lockingFieldStatus = this.isDataSetCompleted || this.isPeriodLocked;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['isDataSetCompleted'] &&
      !changes['isDataSetCompleted'].firstChange
    ) {
      this.lockingFieldStatus = this.isDataSetCompleted || this.isPeriodLocked;
    }
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }

  updateDataSetCompleteness() {
    this.onUpdateDataSetCompleteness.emit();
  }

  openSectionList() {
    this.onSectionListOpen.emit();
  }

  viewUserCompletenessInformation(dataSetsCompletenessInfo) {
    this.onViewUserCompletenessInformation.emit(dataSetsCompletenessInfo);
  }

  onValidatingDateEntry() {
    this.validatingEntryForm.emit();
  }

  changePagination(page) {
    this.onPaginationChange.emit(page);
  }

  updateData(event) {
    if (!this.lockingFieldStatus) {
      this.onChange.emit(event);
    }
  }
}
