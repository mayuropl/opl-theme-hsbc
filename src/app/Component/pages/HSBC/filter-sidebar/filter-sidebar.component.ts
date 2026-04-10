import { Component, EventEmitter, Input, Output, SimpleChanges, viewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatAccordion } from '@angular/material/expansion';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants, HsnCodeLength } from 'src/app/CommoUtils/constants';
import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
import { MsmeService } from 'src/app/services/msme.service';
import { parseFormattedNumber } from 'src/app/shared/pipes/comma-formatter.pipe';
import * as _ from 'lodash';

@Component({
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent {
  constants: any = Constants;
  //filterListMaster: any[] = [];
  isActive: boolean = true;
  maxDate: Date = new Date(); // today
  minDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 5)); // 5 years back
  fromDate: Date | null = null;
  toDate: Date | null = null;
  @Input({ required: true }) filterListMaster: any[];
  @Input({ required: true }) isProcessing: boolean = false;
  @Input({ required: true }) customerTypeInActive: boolean = false;
  @Input() customerType: number;
  @Output() apply = new EventEmitter<any[]>();
  @Output() reset = new EventEmitter<any>();
  @Output() toggleChanged = new EventEmitter<boolean>();

  accordion = viewChild.required(MatAccordion);
  constructor(private msmeService: MsmeService, private commonService: CommonService, private existingProspectsDropDownService: ExistingProspectsDropDownService) {
    this.searchSubject.pipe(
      map(
        e => {
          e.filter2.value = e.filter2.searchValue.trim();  // Mutate original instead of creating copy
          return e;
        }),
      debounceTime(300),
      tap(({ parentFilter, filter2 }) => {
        // Reset after debounce, before validation
        this.resetFilterCount(parentFilter, filter2);
        filter2.json.keys = [];
      }),
      filter(e => {
        const listName = e.filter2.json.listName;
        // Handle both PRODUCT_HSN and PRODUCT_SAC with same validation
        if (listName === 'PRODUCT_HSN' || listName === 'PRODUCT_SAC') {
          if (!e.filter2.json.value) {
            return;
          }
          return this.isValidHsnInput(e.filter2.value, e.filter2.json.value, e.filter2);
        }
        return true; // allow other list types
      }),
    ).subscribe(({ parentFilter, filter2 }) => {
      this.getListFromApi(parentFilter, filter2);
    });
  }
  ngOnInit() {
    console.log("filterListMaster::::", this.filterListMaster)
    this.isActive = !this.customerTypeInActive;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerTypeInActive']) {
      this.isActive = !this.customerTypeInActive;
    }
    if (changes['filterListMaster'] && changes['filterListMaster'].currentValue) {
      console.log("ngOnChanges filterListMaster::::", this.filterListMaster);
      // safest place to react to parent input updates

      this.filterListMaster.forEach(filter1 => {

        if (filter1.filterName == 'New-age Economy') {
          filter1.insightTwoFilter.forEach(filter2 => {
            if (filter2.json) {
              if (filter2?.json?.fromDate) {
                filter2.json.fromDate = this.toYMDLocal(new Date(filter2.json.fromDate));
              }
              if (filter2?.json?.toDate) {
                filter2.json.toDate = this.toYMDLocal(new Date(filter2.json.toDate));
              }
            }
          });
        }

      });
    }

  }

  onApply() {
    // Check for validation errors in min/max filters before applying
    const errorFilters: string[] = [];

    this.filterListMaster.forEach(filter1 => {
      filter1.insightTwoFilter?.forEach(filter2 => {
        if (filter2.type === 'minMax' && filter2.json?.validationError) {
          errorFilters.push(filter2.filterTwoName || filter1.filterName);
        }
      });
    });

    if (errorFilters.length > 0) {
      this.commonService.errorSnackBar(`Please correct validation errors in: ${errorFilters.join(', ')}`);
      return;
    }

    this.apply.emit(this.filterListMaster); // Send data back to parent
  }

  onReset() {
    this.reset.emit(); // Send data back to parent
    // this.toggleChanged.emit(false);
    // this.isActive = true;
  }

  private searchSubject = new Subject<any>();
  onSearchChange(parentFilter: any, filter2: any) {
    this.searchSubject.next({ parentFilter, filter2 });
  }

  filterCheckBox(filter2) {
    let searchValue = filter2.searchValue;
    if (searchValue) {
      let checkboxList: any[] = filter2.json.keys;
      if (filter2.json.checkboxListTemp == undefined || filter2.json.checkboxListTemp == null) {
        filter2.json.checkboxListTemp = _.cloneDeep(checkboxList);
      }
      const normalizedSearch = searchValue.toUpperCase().trim().replace(/[-–—]/g, '-');
      filter2.json.keys = filter2.json.checkboxListTemp.filter(item => item.name.toUpperCase().trim().replace(/[-–—]/g, '-').includes(normalizedSearch));
    } else if (filter2.json.checkboxListTemp) {
      filter2.json.keys = _.cloneDeep(filter2.json.checkboxListTemp);
      filter2.json.checkboxListTemp = null; // CORPCARD-1282
    }
  }

  checkCountRadioButton(filter1, filter2) {
    if (filter2.json.count == 0 && filter2.json.value != undefined && filter2.json.value != null) {
      filter1.count = filter1.count + 1;
      filter2.json.count = filter2.json.count + 1;
    }

  }

  onKeysDualChange(filter1: any, filter2: any) {

    if (filter2?.json) {
      // Reset count for previously selected keys
      if (filter2.json.keys && filter2.json.keys.length > 0) {
        filter1.count = filter1.count - filter2.json.count;
        filter2.json.count = 0;
      }

      filter2.json.keys = [];
      filter2.selected = [];
      filter2.noResultsFound = false;  // Clear no results message

      // Re-trigger search if search value exists
      if (filter2.searchValue?.trim()) {
        this.onSearchChange(filter1, filter2);
      }
    }
  }

  /**
   * Update count for min/max filter
   * Count = 1 if either min OR max has value
   * Count = 0 if both are empty
   */
  private updateMinMaxCount(filter1: any, filter2: any): void {
    const hasMin = filter2.json.min !== null && filter2.json.min !== '' && filter2.json.min !== undefined;
    const hasMax = filter2.json.max !== null && filter2.json.max !== '' && filter2.json.max !== undefined;
    const hasValue = hasMin || hasMax;

    if (hasValue && filter2.json.count === 0) {
      // Activate filter
      filter1.count++;
      filter2.json.count = 1;
    } else if (!hasValue && filter2.json.count === 1) {
      // Deactivate filter
      filter1.count--;
      filter2.json.count = 0;
    }
    // If count is already correct, do nothing
  }

  checkCountCheckBox(event: MatCheckboxChange, filter1, filter2, itemId, isSingleSelect?: boolean) {
    let checkboxList;
    if (filter2.json.checkboxListTemp) {
      checkboxList = filter2.json.checkboxListTemp;
    } else {
      checkboxList = filter2.json.keys;
    }

    if (!filter2.selected) {
      filter2.selected = [];
    }
    if (itemId == -1) {
      if (event.checked) {
        filter1.count = filter1.count - filter2.json.count + checkboxList.length;
        filter2.json.count = checkboxList.length;
        filter2.selected = [];
        checkboxList.forEach((element, i) => {
          element.selected = true;
          filter2.selected.push(element.value);
        });
      } else {
        filter1.count = filter1.count - checkboxList.length;
        filter2.json.count = 0;
        checkboxList.forEach(element => {
          element.selected = false;
          filter2.selected = [];
        });
      }
    } else {
      if (event.checked) {

        if (isSingleSelect) {
          filter2.selected = [];
          checkboxList.forEach(element => {
            if (element.value != event.source.value && element.selected) {
              filter1.count = filter1.count - 1;
              filter2.json.count = filter2.json.count - 1;
              element.selected = false;
            }
            if (element.subKeys?.length > 0) {
              element.subKeys.forEach(subElement => {
                if (subElement.value != event.source.value && subElement.selected) {
                  filter1.count = filter1.count - 1;
                  filter2.json.count = filter2.json.count - 1;
                  subElement.selected = false;
                }
              });
            }

          });
        }
        filter1.count = filter1.count + 1;
        filter2.json.count = filter2.json.count + 1;
        filter2.selected.push(event.source.value);

        if (checkboxList[0].sNo == -1 && filter2.selected.length == (checkboxList.length - 1)) {
          filter2.selected.push(filter2.json.keys[0].value);
          filter2.json.keys[0].selected = true;
          filter1.count = filter1.count + 1;
          filter2.json.count = filter2.json.count + 1;
        }
      } else {
        if (checkboxList[0].sNo == -1 && filter2.selected.length == checkboxList.length) {
          filter1.count = filter1.count - 2;
          filter2.json.count = filter2.json.count - 2;
          const i = checkboxList.findIndex(x => x.sNo === -1);
          filter2.selected.splice(i, 1)
          checkboxList[i].selected = false;
        } else {
          const i = checkboxList.findIndex(x => x.sNo === itemId);
          checkboxList[i].selected = false;

          filter1.count = filter1.count - 1;
          filter2.json.count = filter2.json.count - 1;
        }
        const i = filter2.selected.findIndex(x => x === event.source.value);
        filter2.selected.splice(i, 1)
      }
    }
  }

  onBusinessLineParentChange(event: MatCheckboxChange, filter1: any, filter2: any, parentItem: any) {
    const isChecked = event.checked;
    parentItem.selected = isChecked;

    if (parentItem.subKeys && parentItem.subKeys.length > 0) {
      parentItem.subKeys.forEach(child => {
        child.selected = isChecked;
      });
    }
    this.recalculateBusinessLineCounts(filter1, filter2);
  }

  onBusinessLineChildChange(event: MatCheckboxChange, filter1: any, filter2: any, parentItem: any, childItem: any) {
    childItem.selected = event.checked;

    // If any child is selected, parent must be selected
    const anyChildSelected = parentItem.subKeys?.some(child => child.selected);
    if (anyChildSelected) {
      parentItem.selected = true;
    } else {
      // If no children selected, parent is deselected
      parentItem.selected = false;
    }
    this.recalculateBusinessLineCounts(filter1, filter2);
  }

  recalculateBusinessLineCounts(filter1: any, filter2: any) {
    // subtract old count for this filter2 first?
    // safer to recalculate absolute count for this filter2
    // currently filter1.count includes *all* subfilters (filter2s)
    // so we need delta. or tracking.
    // simpler: reset filter2.json.count to 0 and recount.
    // BUT filter1.count needs to be adjusted by delta.

    const oldCount = filter2.json.count || 0;
    let newCount = 0;

    // Count all selected items in this businessLine structure
    if (filter2.json?.keys) {
      filter2.json.keys.forEach(parent => {
        if (parent.selected) newCount++;
        if (parent.subKeys) {
          parent.subKeys.forEach(child => {
            if (child.selected) newCount++;
          });
        }
      });
    }

    const delta = newCount - oldCount;
    filter1.count = (filter1.count || 0) + delta;
    filter2.json.count = newCount;

    // Update filter2.selected array for consistency (optional but good practice)
    filter2.selected = [];
    if (filter2.json?.keys) {
      filter2.json.keys.forEach(parent => {
        if (parent.selected) filter2.selected.push(parent.value);
        if (parent.subKeys) {
          parent.subKeys.forEach(child => {
            if (child.selected) filter2.selected.push(child.value);
          });
        }
      });
    }
  }



  getListFromApi(parentFilter: any, filter2: any) {
    let searchValue = filter2.searchValue;
    if (!searchValue) return;  // Guard only, reset already done
    let req: any = {};
    req.listName = filter2.json.listName;
    if (filter2.json.listName == "PRODUCT_HSN" || filter2.json.listName == "PRODUCT_SAC") {
      req.hsnCodeLen = filter2.json.value;
      req.searchHsnByWord = filter2.searchHsnByWord;
      if (!req.hsnCodeLen) {
        return;
      }
    }
    req.searchValue = searchValue;
    this.msmeService.getFilterListFromApi(req).subscribe((response: any) => {
      if (response && response.status == 200 && response.data) {
        filter2.json.keys = response.data;
        filter2.noResultsFound = response.data?.length === 0;  // Add this flag
        filter2.json.keys.forEach(element => {
          if (filter2.json.isAutoSelect) {
            element.selected = true;
          }
        });

        if (filter2.json.isAutoSelect) {
          this.filterListMaster = this.existingProspectsDropDownService.selectAllCheckbox(this.filterListMaster, filter2);
        }
        filter2?.selected?.forEach(element => {
          const i = filter2.json.keys.findIndex(x => x.name === element);
          filter2.json.keys[i].selected = true;
        });
      } else {
        this.commonService.errorSnackBar(response.message)
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
    })

  }

  onToggle(event: any) {
    const isCustomerTypeInActive = event.checked === false;
    this.toggleChanged.emit(isCustomerTypeInActive);
  }

  shouldShowItem(item: any): boolean {
    if (item?.filterName && item.filterName.trim() === "Credit Churn Analyisis") {
      if (this.customerType && this.customerType === this.constants.CustomerType.ETB) {
        return true;
      }
      return false;
    } else if (item?.filterName && item.filterName.trim() === "Basic Bureau Data (Pre-screen)" && this.customerType && this.customerType === this.constants.CustomerType.ETB) {
      return false;
    }
    return true;
  }


  toYMDLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`; // "YYYY-MM-DD"
  }

  onDateChanged(type: 'from' | 'to', filter1: any, filter2: any, event: any) {
    const selectedDate: Date | null = event?.value;
    if (!selectedDate) return;

    const ymd = this.toYMDLocal(selectedDate);

    if (type === 'from') filter2.json.fromDate = ymd;
    else filter2.json.toDate = ymd;

    const { fromDate, toDate } = filter2.json;
    if (fromDate && toDate && fromDate > toDate) {

      [filter2.json.fromDate, filter2.json.toDate] = [toDate, fromDate];
    }

    this.updateCount(filter1, filter2);
  }



  onDatepickerOpened(type: 'from' | 'to', filter1: any, filter2: any) {
    if (type === 'from' && !filter2.json.fromDate) {
      filter2.json.fromDate = this.toYMDLocal(new Date());
    }
    if (type === 'to' && !filter2.json.toDate) {
      filter2.json.toDate = this.toYMDLocal(new Date());
    }

    this.updateCount(filter1, filter2);
  }

  private updateCount(filter1: any, filter2: any) {
    if (filter2.json.fromDate || filter2.json.toDate) {
      if (filter2.json.count == 0) {
        filter1.count += 1;
      }
      filter2.json.count = 1;
    } else {
      filter2.json.count = 0;
      filter1.count = 0;
    }
  }

  onFocus(type: 'from' | 'to', filter1: any, filter2: any) {
    if (filter1.filterName == 'New-age Economy') {
      this.onDatepickerOpened(type, filter1, filter2);
    }
  }

  onModelChanged(type: 'from' | 'to', datePicker: any, value: any) {
    if (!value) {
      // if date cleared, open datepicker automatically
      datePicker.open();
    }
  }

  isValidHsnInput(input: string, selectedLengthStr: string, filter2: any): boolean {
    //CORPCARD-5084
    const map: Record<string, HsnCodeLength> = {
      TWO: HsnCodeLength.TWO,
      FOUR: HsnCodeLength.FOUR,
      SIX: HsnCodeLength.SIX,
    };

    const selectedLength = map[selectedLengthStr];
    console.log(selectedLength);
    if (!selectedLength) return false;
    const isNumeric = /^\d+$/.test(input);

    if (!isNumeric) {
      filter2.searchHsnByWord = true;
      // Non-numeric input → allow more than 2 characters
      return input.length > 2;
    }

    // Numeric input
    filter2.searchHsnByWord = false;  // Add this line

    return (
      (selectedLength === HsnCodeLength.TWO && input.length === 2) ||
      (selectedLength === HsnCodeLength.FOUR && (
        // input.length === 3 ||
         input.length === 4)) ||
      (selectedLength === HsnCodeLength.SIX && (input.length === 5 || input.length === 6))
    );
  }


  /**
   * Reset filter count and clear selections
   */
  private resetFilterCount(parentFilter: any, filter2: any): void {
    const previousCount = filter2.json.count || 0;
    if (previousCount > 0) {
      parentFilter.count -= previousCount;
      filter2.json.count = 0;
    }
    filter2.selected = [];
    filter2.noResultsFound = false;  // Clear no results message
  }

  /**
   * Format a number with comma separators (e.g., 1000000 → 1,000,000.00)
   */
  formatNumberWithCommas(value: number | string | null): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numValue = typeof value === 'string' ? parseFormattedNumber(value) : value;
    if (numValue === null || isNaN(numValue)) {
      return '';
    }

    const fixedValue = numValue.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  /**
   * Handle min value blur - format with commas and validate
   */
  onMinBlur(filter1: any, filter2: any): void {
    if (filter2.json.min || filter2.json.min === 0) {
      // Parse raw value (remove commas if any)
      const rawValue = parseFormattedNumber(filter2.json.min?.toString());

      if (rawValue !== null && !isNaN(rawValue)) {
        // Store raw value for filtering
        filter2.json.minRaw = rawValue;
        // Store formatted value for display
        filter2.json.min = this.formatNumberWithCommas(rawValue);
      } else {
        filter2.json.min = null;
        filter2.json.minRaw = null;
      }
    } else {
      filter2.json.minRaw = null;
    }

    // Validate min <= max
    this.validateMinMax(filter2);

    // Update count
    this.updateMinMaxCount(filter1, filter2);
  }

  /**
   * Handle max value blur - format with commas and validate
   */
  onMaxBlur(filter1: any, filter2: any): void {
    if (filter2.json.max || filter2.json.max === 0) {
      // Parse raw value (remove commas if any)
      const rawValue = parseFormattedNumber(filter2.json.max?.toString());

      if (rawValue !== null && !isNaN(rawValue)) {
        // Store raw value for filtering
        filter2.json.maxRaw = rawValue;
        // Store formatted value for display
        filter2.json.max = this.formatNumberWithCommas(rawValue);
      } else {
        filter2.json.max = null;
        filter2.json.maxRaw = null;
      }
    } else {
      filter2.json.maxRaw = null;
    }

    // Validate min <= max
    this.validateMinMax(filter2);

    // Update count
    this.updateMinMaxCount(filter1, filter2);
  }

  /**
   * Handle min value focus - keep formatted value with commas
   */
  onMinFocus(filter2: any): void {
    // Keep the formatted value with commas - no change needed
    // The value already has commas from real-time formatting
  }

  /**
   * Handle max value focus - keep formatted value with commas
   */
  onMaxFocus(filter2: any): void {
    // Keep the formatted value with commas - no change needed
    // The value already has commas from real-time formatting
  }

  /**
   * Check if a main filter has any validation errors in its sub-filters
   */
  hasFilterError(filter1: any): boolean {
    return filter1.insightTwoFilter?.some(filter2 =>
      filter2.type === 'minMax' && filter2.json?.validationError
    ) || false;
  }

  /**
   * Check if a sub-filter has validation error
   */
  hasSubFilterError(filter2: any): boolean {
    return filter2.type === 'minMax' && !!filter2.json?.validationError;
  }

  /**
   * Validate that min <= max
   */
  validateMinMax(filter2: any): boolean {
    const minRaw = filter2.json.minRaw;
    const maxRaw = filter2.json.maxRaw;

    if (minRaw !== null && minRaw !== undefined &&
      maxRaw !== null && maxRaw !== undefined &&
      minRaw > maxRaw) {
      filter2.json.validationError = 'Min value is more than Max value please enter correct value';
      return false;
    }

    filter2.json.validationError = null;
    return true;
  }

  /**
   * Sanitize input to allow only numeric characters, decimal point, and optional negative sign
   * Also strips commas since they will be re-added during formatting
   */
  sanitizeNumericInput(value: string, allowNegative: boolean = false): string {
    if (!value) return '';

    // Remove all non-numeric characters except decimal point, negative sign, and commas
    // Then remove commas (they'll be re-added during formatting)
    let sanitized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '');

    // Handle negative sign
    if (!allowNegative) {
      sanitized = sanitized.replace(/-/g, '');
    } else {
      // Keep only leading negative sign
      const hasNegative = sanitized.startsWith('-');
      sanitized = sanitized.replace(/-/g, '');
      if (hasNegative) {
        sanitized = '-' + sanitized;
      }
    }

    // Keep only first decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    return sanitized;
  }

  /**
   * Handle min input change - sanitize and format with commas in real-time
   */
  onMinInput(filter2: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value || '';

    // Sanitize and format
    const formatted = this.formatInputRealTime(currentValue, filter2.json.allowNegative, input);

    // Update both model and input element
    filter2.json.min = formatted;
    input.value = formatted;

    // Update raw value for validation
    const rawValue = parseFormattedNumber(formatted);
    filter2.json.minRaw = (rawValue !== null && !isNaN(rawValue)) ? rawValue : null;

    // Validate in real-time to clear errors when corrected
    this.validateMinMax(filter2);
  }

  /**
   * Handle max input change - sanitize and format with commas in real-time
   */
  onMaxInput(filter2: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value || '';

    // Sanitize and format
    const formatted = this.formatInputRealTime(currentValue, filter2.json.allowNegative, input);

    // Update both model and input element
    filter2.json.max = formatted;
    input.value = formatted;

    // Update raw value for validation
    const rawValue = parseFormattedNumber(formatted);
    filter2.json.maxRaw = (rawValue !== null && !isNaN(rawValue)) ? rawValue : null;

    // Validate in real-time to clear errors when corrected
    this.validateMinMax(filter2);
  }

  /**
   * Format input with commas in real-time while preserving cursor position
   */
  private formatInputRealTime(value: string, allowNegative: boolean, input: HTMLInputElement): string {
    // Get cursor position before formatting
    const cursorPos = input.selectionStart || 0;
    const oldLength = value.length;
    const commasBefore = (value.substring(0, cursorPos).match(/,/g) || []).length;

    // Sanitize first (remove non-numeric except decimal and negative)
    let sanitized = this.sanitizeNumericInput(value, allowNegative);

    // Don't format if empty or just a negative sign or decimal
    if (!sanitized || sanitized === '-' || sanitized === '.') {
      return sanitized;
    }

    // Split into integer and decimal parts
    const parts = sanitized.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : null;

    // Format integer part with commas
    const isNegative = integerPart.startsWith('-');
    const absInteger = isNegative ? integerPart.substring(1) : integerPart;
    const formattedInteger = absInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let formatted = (isNegative ? '-' : '') + formattedInteger;
    if (decimalPart !== null) {
      formatted += '.' + decimalPart;
    }

    // Calculate new cursor position
    const newLength = formatted.length;
    const commasAfter = (formatted.substring(0, cursorPos + (newLength - oldLength)).match(/,/g) || []).length;
    const newCursorPos = cursorPos + (commasAfter - commasBefore);

    // Set cursor position after Angular updates the view
    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    return formatted;
  }

}
