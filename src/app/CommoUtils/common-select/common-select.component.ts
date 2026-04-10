import { Component, EventEmitter, Input, Output, OnInit, ElementRef, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

// Interface for grouped options
export interface GroupedOption {
  parentId: number;
  groupName: string;
  options: Array<{ label: string; value: any }>;
}

@Component({
  selector: 'app-common-select',
  templateUrl: './common-select.component.html',
  styleUrls: ['./common-select.component.scss']
})
export class CommonSelectComponent implements OnInit {
  @Input() options: Array<string | { label: string; value: any }> = [];
  @Input() groupedOptions: GroupedOption[] = []; // New input for grouped options
  @Input() isMultiple = false;
  @Input() searchEnabled = false;
  @Input() label = '';
  @Input() labelIconClass = '';
  @Input() infoTooltip: string = '';
  @Input() infoIconClass: string = 'fas fa-info-circle darkgreen_text ml-1';
  @Input() usePopup: boolean = false;
  @Input() popupData: any = null;
  @Input() controlClass = '';
  @Output() openPopup = new EventEmitter<any>();
  @Input() showRadioGroup = true; 
  @Input() radioOptions: { label: string, value: any }[] = [];
  @Input() showMinCount: boolean = false;
  @Input() placeholder: string = '';
  @Input() clearMinMax: boolean = false;
  @Input() showGroupedAll: boolean = true;
  
  private _initialMinValue: any = null;
  private _initialMaxValue: any = null;
  
  @Input()
  get initialMinValue(): any {
    return this._initialMinValue;
  }
  set initialMinValue(val: any) {
    this._initialMinValue = val;
    if (val !== null && val !== undefined) {
      this.minCount = val;
      this.updateMinMaxDisplayText();
      // Use setTimeout to ensure change detection runs after the setter completes
      setTimeout(() => {
        if (this.cdr) {
          this.cdr.detectChanges();
        }
      }, 0);
    }
  }
  
  @Input()
  get initialMaxValue(): any {
    return this._initialMaxValue;
  }
  set initialMaxValue(val: any) {
    this._initialMaxValue = val;
    if (val !== null && val !== undefined) {
      this.maxCount = val;
      this.updateMinMaxDisplayText();
      // Use setTimeout to ensure change detection runs after the setter completes
      setTimeout(() => {
        if (this.cdr) {
          this.cdr.detectChanges();
        }
      }, 0);
    }
  }
   private _selectedValue: any | any[] = this.isMultiple ? [] : '';
   minCount:any;
   maxCount:any;
  @Input()
  get selectedValue() {
    return this._selectedValue;
  }
  set selectedValue(val: any | any[]) {
    this._selectedValue = val;
    this.selectedValueChange.emit(this._selectedValue);
  }

  @Output() selectedValueChange = new EventEmitter<any | any[]>();

   @Input() radioSelection: number | null = null;
  @Output() radioSelectionChange = new EventEmitter<number | null>();
  @Output() searchValueChange = new EventEmitter<string>();
  @Output() onOptionSelected = new EventEmitter<any>();
   @ViewChild(MatSelect) matSelect!: MatSelect;
  @Output() scrolledToBottom = new EventEmitter<void>();
  @Input() resetTrigger: boolean = false;
  @Input() disableOptions: boolean = false;
  @Input() skipAutoSelect: boolean = false;
  @Output() minMaxChanged = new EventEmitter<{ min: number; max: number }>();

  searchText = '';
  private lastClickedOptionValue: any = null;
  tooltipText: string = '';
  isDropdownOpen: boolean = false;
  
  // Cached filtered grouped options for search
  private _filteredGroupedOptionsCache: GroupedOption[] = [];

   isAllSelected(): boolean {
    if (!this.isMultiple || !this.options || this.options.length === 0) {
      return false;
    }
    
    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    if (currentValue.length === 0) {
      return false;
    }

    const allOptionValues = this.options.map((opt: any) =>
      typeof opt === 'string' ? opt : opt.value
    );

     return allOptionValues.length > 0 && 
           allOptionValues.every(val => currentValue.includes(val));
  }
   

  getDisplayText(): string {
    // Get radio selection label if radio group is enabled
    const radioLabel = this.getRadioLabel();
    
    if (!this.isMultiple) {
      // single select display
      const selectedOption = this.options.find((opt: any) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        return optValue === this._selectedValue;
      });
      const optionText = selectedOption
        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
        : '';
      
      return this.formatDisplayWithRadio(radioLabel, optionText);
    }
  
    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    if (currentValue.length === 0) {
      return this.formatDisplayWithRadio(radioLabel, '');
    }
  
    const allOption = this.options.find((opt: any) => {
      if (typeof opt === 'string') {
        return opt.toLowerCase() === 'all';
      }
      return opt.value === -1 || opt.label?.toLowerCase() === 'all';
    });
    const allValue = allOption ? (typeof allOption === 'string' ? allOption : allOption.value) : null;
  
    // When searching, use filtered options
    if (this.searchEnabled && this.searchText && this.searchText.trim() !== '') {
      const filteredOpts = this.filteredOptions();
      const filteredOptionValues = filteredOpts.map((opt: any) =>
        typeof opt === 'string' ? opt : opt.value
      );
  
      // Check if all filtered options are selected
      const allFilteredSelected = filteredOptionValues.length > 0 &&
        filteredOptionValues.every(val => currentValue.includes(val)) &&
        currentValue.length >= filteredOptionValues.length;
  
      if (allFilteredSelected) {
        const allText = allOption
          ? (typeof allOption === 'string' ? allOption : allOption.label)
          : 'All';
        return this.formatDisplayWithRadio(radioLabel, allText);
      }
    }
  
    // Check if all options are selected
    const allOptionValues = this.options.map((opt: any) =>
      typeof opt === 'string' ? opt : opt.value
    );
    const nonAllOptionValues = allValue !== null
      ? allOptionValues.filter(v => v !== allValue)
      : allOptionValues;
  
    const allNonAllSelected = nonAllOptionValues.length > 0 &&
      nonAllOptionValues.every(val => currentValue.includes(val));
  
    const allOptionsSelected = currentValue.length > 1 &&
      allNonAllSelected &&
      (allValue === null || currentValue.includes(allValue)) &&
      currentValue.length === allOptionValues.length;
  
    if (allOptionsSelected) {
      const allText = allOption
        ? (typeof allOption === 'string' ? allOption : allOption.label)
        : 'All';
      return this.formatDisplayWithRadio(radioLabel, allText);
    }
  
    // Otherwise, display selected option labels normally
    const selectedText = currentValue.map(val => {
      const option = this.options.find((opt: any) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        return optValue === val;
      });
      return option
        ? (typeof option === 'string' ? option : option.label)
        : '';
    }).filter(Boolean).join(', ');
    
    return this.formatDisplayWithRadio(radioLabel, selectedText);
  }

  // Get the label of the currently selected radio option (public for template)
  getRadioLabel(): string {
    if (!this.showRadioGroup || this.radioSelection === null || this.radioSelection === undefined) {
      return '';
    }
    
    const selectedRadio = this.radioOptions.find(radio => radio.value === this.radioSelection);
    return selectedRadio ? selectedRadio.label : '';
  }

  // Get placeholder text - shows radio label if selected, otherwise original placeholder
  getPlaceholderText(): string {
    const radioLabel = this.getRadioLabel();
    return radioLabel || this.placeholder;
  }

  // Get just the options text without radio label (public for template)
  getOptionsText(): string {
    // Handle grouped options
    if (this.hasGroupedOptions()) {
      return this.getGroupedOptionsText();
    }

    if (!this.isMultiple) {
      const selectedOption = this.options.find((opt: any) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        return optValue === this._selectedValue;
      });
      return selectedOption
        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
        : '';
    }
  
    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    if (currentValue.length === 0) {
      return '';
    }
  
    const allOption = this.options.find((opt: any) => {
      if (typeof opt === 'string') {
        return opt.toLowerCase() === 'all';
      }
      return opt.value === -1 || opt.label?.toLowerCase() === 'all';
    });
    const allValue = allOption ? (typeof allOption === 'string' ? allOption : allOption.value) : null;
  
    // Check if all options are selected
    const allOptionValues = this.options.map((opt: any) =>
      typeof opt === 'string' ? opt : opt.value
    );
    const nonAllOptionValues = allValue !== null
      ? allOptionValues.filter(v => v !== allValue)
      : allOptionValues;
  
    const allNonAllSelected = nonAllOptionValues.length > 0 &&
      nonAllOptionValues.every(val => currentValue.includes(val));
  
    const allOptionsSelected = currentValue.length > 1 &&
      allNonAllSelected &&
      (allValue === null || currentValue.includes(allValue)) &&
      currentValue.length === allOptionValues.length;
  
    if (allOptionsSelected) {
      return allOption
        ? (typeof allOption === 'string' ? allOption : allOption.label)
        : 'All';
    }
  
    // Otherwise, display selected option labels normally
    return currentValue.map(val => {
      const option = this.options.find((opt: any) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        return optValue === val;
      });
      return option
        ? (typeof option === 'string' ? option : option.label)
        : '';
    }).filter(Boolean).join(', ');
  }

  // Get display text for grouped options
  getGroupedOptionsText(): string {
    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    if (currentValue.length === 0) {
      return '';
    }

    // Check if "all" is selected
    if (currentValue.includes(-1)) {
      return 'All';
    }

    // Get all option values from grouped options
    const allGroupedValues = this.getAllGroupedOptionValues();
    
    // Check if all options are selected (excluding 'all')
    const nonAllValues = currentValue.filter(v => v !== -1);
    if (nonAllValues.length === allGroupedValues.length && 
        allGroupedValues.every(v => nonAllValues.includes(v))) {
      return 'All';
    }

    // Get labels for selected values
    const selectedLabels: string[] = [];
    this.groupedOptions.forEach(group => {
      group.options.forEach(opt => {
        if (currentValue.includes(opt.value)) {
          selectedLabels.push(opt.label);
        }
      });
    });

    return selectedLabels.join(', ');
  }

  // Format display text with radio label prefix (kept for backward compatibility)
  private formatDisplayWithRadio(radioLabel: string, optionText: string): string {
    if (radioLabel && optionText) {
      return `${radioLabel} - ${optionText}`;
    }
    if (radioLabel && !optionText) {
      return radioLabel;
    }
    return optionText;
  }

  // Get tooltip text showing all selected options separately (each on new line)
  getTooltipText(): string {
    if (!this.isMultiple) {
      return '';
    }

    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    if (currentValue.length === 0) {
      return '';
    }

    // Get radio label if available
    const radioLabel = this.getRadioLabel();

    // Get all selected option labels
    const selectedLabels = currentValue.map(val => {
      const option = this.options.find((opt: any) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        return optValue === val;
      });
      return option
        ? (typeof option === 'string' ? option : option.label)
        : '';
    }).filter(Boolean);

    // Build tooltip text with radio label prefix and each option on separate line
    let tooltipLines: string[] = [];
    
    if (radioLabel) {
      tooltipLines.push(`${radioLabel}:`);
    }
    
    selectedLabels.forEach(label => {
      tooltipLines.push(`• ${label}`);
    });

    return tooltipLines.join('\n');
  }
  

  // filteredOptions(): string[] {
  //   if (!this.searchEnabled || !this.searchText.trim()) {
  //     return this.options;
  //   }
  //   const filter = this.searchText.toLowerCase();
  //   return this.options.filter(o => o.toLowerCase().includes(filter));
  // }
  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}
  filteredOptions(): Array<string | { label: string; value: any }> {
    if (!this.searchEnabled || !this.searchText.trim()) {
      return this.options;
    }
  
    const filter = this.searchText.toLowerCase();
  
    // Filter options by searchText
    let filtered = this.options.filter(o => {
      const label = typeof o === 'string' ? o : (o?.label || '');
      return label.toLowerCase().includes(filter);
    });
  
    // Include any currently selected options even if they don't match the filter
    if (this.isMultiple && Array.isArray(this._selectedValue)) {
      const selectedNotInFiltered = this._selectedValue
        .filter(val => !filtered.some(opt => (typeof opt === 'string' ? opt : opt.value) === val))
        .map(val => {
          return this.options.find(opt => (typeof opt === 'string' ? opt : opt.value) === val);
        })
        .filter(Boolean) as Array<string | { label: string; value: any }>;
  
      filtered = [...filtered, ...selectedNotInFiltered];
    }
  
    // Remove duplicates just in case
    const uniqueOptions = filtered.filter((opt, index, self) =>
      index === self.findIndex(o => (typeof o === 'string' ? o : o.value) === (typeof opt === 'string' ? opt : opt.value))
    );
  
    return uniqueOptions;
  }
  
  

  ngOnInit() {
    if (this.isMultiple && !Array.isArray(this._selectedValue)) {
      this._selectedValue = [];
    }
    if (this.radioSelection === undefined) {
      this.radioSelection = null; 
    }
    // Initialize filtered grouped options cache
    this.updateFilteredGroupedOptionsCache();
  }

  ngOnChanges(changes: SimpleChanges) {
  if (changes['resetTrigger'] && changes['resetTrigger'].currentValue) {
     this._selectedValue = this.isMultiple ? [] : '';
    this.selectedValueChange.emit(this._selectedValue);
    
     this.minCount = null;
    this.maxCount = null;
    this.minMaxDisplayText = '';
    this.minMaxChanged.emit({ min: this.minCount, max: this.maxCount });
    
     this.searchText = '';
  }
  
   if (changes['options'] && this.isMultiple && this.options && this.options.length > 0) {
    // Skip auto-selection if skipAutoSelect is true
    if (this.skipAutoSelect) {
      return;
    }
    
    // Skip auto-selection if initialMinValue or initialMaxValue are set (min/max range is being used instead)
    if (this._initialMinValue !== null || this._initialMaxValue !== null) {
      return;
    }
    
    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    const previousOptions = changes['options'].previousValue || [];
    
     const newOptionValues = this.options.map((opt: any) =>
      typeof opt === 'string' ? opt : opt.value
    );
    const previousOptionValues = previousOptions.map((opt: any) =>
      typeof opt === 'string' ? opt : opt.value
    ) || [];
    
     const allOption = this.options.find((opt: any) => {
      if (typeof opt === 'string') {
        return opt.toLowerCase() === 'all';
      }
      return opt.value === -1 || opt.label?.toLowerCase() === 'all';
    });
    const allValue = allOption ? (typeof allOption === 'string' ? allOption : allOption.value) : null;
    
      const isSearching = this.searchEnabled && this.searchText && this.searchText.trim() !== '';
    
      if (isSearching && currentValue.length === 0) {
       return;
    }
    
     const optionsWereAppended = previousOptionValues.length > 0 && 
      previousOptionValues.every(val => newOptionValues.includes(val)) &&
      newOptionValues.length > previousOptionValues.length;
    
     const wasAllSelected = previousOptionValues.length > 0 && (
      (currentValue.length === previousOptionValues.length && 
       previousOptionValues.every(val => currentValue.includes(val))) ||
      (allValue !== null && currentValue.includes(allValue))
    );
    
      if (optionsWereAppended && wasAllSelected && !isSearching) {
      if (allValue !== null) {
         this._selectedValue = [allValue, ...newOptionValues.filter(v => v !== allValue)];
      } else {
         this._selectedValue = [...newOptionValues];
      }
      this.selectedValueChange.emit(this._selectedValue);
      return;
    }
  
      const isInitialLoad = previousOptions.length === 0 && newOptionValues.length > 0;

      // const skipAutoSelect = this.placeholder === 'Select PSL Status';
    
     if (currentValue.length === 0 && isInitialLoad && !isSearching) {
      if (allOption) {
         this._selectedValue = newOptionValues.includes(allValue) 
          ? [allValue, ...newOptionValues.filter(v => v !== allValue)]
          : newOptionValues;
      } else {
         this._selectedValue = [...newOptionValues];
      }
      this.selectedValueChange.emit(this._selectedValue);
    }
  }

    if (changes['clearMinMax']?.currentValue === true) {
    this.minCount = null;
    this.maxCount = null;
    this.minMaxDisplayText = '';

    this.minMaxChanged.emit({ min: null, max: null });

    this.refreshTrigger();
  }

  // Update cache when groupedOptions changes
  if (changes['groupedOptions']) {
    this.updateFilteredGroupedOptionsCache();
  }
}

  onDropdownOpened(opened: boolean) {
    this.isDropdownOpen = opened;
    if (opened) {
       this.searchText = '';
       this.searchValueChange.emit('');
       // Reset cache to show all options when dropdown opens
       this.updateFilteredGroupedOptionsCache();
    } else {
       this.searchText = '';
       // Update min/max display text when dropdown closes
       this.updateMinMaxDisplayText();
       // Reset cache when dropdown closes
       this.updateFilteredGroupedOptionsCache();
       // Force refresh after dropdown closes
       setTimeout(() => {
         this.cdr.markForCheck();
         this.cdr.detectChanges();
         this.tooltipText = this.getTooltipText();
       }, 50);
    }
  }

  onRadioChange(value: any) {
    this.radioSelection = value === '' ? null : value;
    this.radioSelectionChange.emit(this.radioSelection);
    
    // Check if "Both" radio option is selected - if so, clear and disable checkbox options
    const selectedRadio = this.radioOptions.find(radio => radio.value === value);
    if (selectedRadio && selectedRadio.label.toLowerCase() === 'both') {
      // Clear all selected checkbox options
      this._selectedValue = this.isMultiple ? [] : '';
      this.selectedValueChange.emit(this._selectedValue);
      this.onOptionSelected.emit(this._selectedValue);
      
      // Disable checkbox options
      this.disableOptions = true;
    } else {
      // Enable checkbox options for other radio selections
      this.disableOptions = false;
    }
    
    this.cdr.detectChanges();
  }

  getOptionLabel(option: any): string {
    return typeof option === 'string' ? option : option.label;
  }

  getOptionValue(option: any): any {
    return typeof option === 'string' ? option : option.value;
  }
  onSearchInput(value: string) { 
    this.searchText = value || '';
    
    this.searchValueChange.emit(value || '');
    
    if (!value || value.trim() === '') {
      this.searchText = '';
    }
    
    // Update filtered grouped options cache
    this.updateFilteredGroupedOptionsCache();
  }

  onSearchKeyDown(event: KeyboardEvent) {
     event.stopPropagation(); 
  }
  
  onOptionClick(optionValue: any) {
     this.lastClickedOptionValue = optionValue;
  }
  
  onSelectionChanged(event: MatSelectChange) {
    let value = event.value;
  
    if (!Array.isArray(value)) value = [value];
  
    const previousValue = Array.isArray(this._selectedValue) 
      ? [...this._selectedValue] 
      : (this._selectedValue ? [this._selectedValue] : []);

    // Handle grouped options "All" selection
    if (this.hasGroupedOptions()) {
      value = this.handleGroupedAllSelection(value, previousValue, event);
      
      let finalValue: any;
      if (this.isMultiple) {
        finalValue = value;
      } else {
        finalValue = value.length > 0 ? value[0] : null;
      }
    
      this._selectedValue = finalValue;
      this.selectedValueChange.emit(this._selectedValue);
      this.onOptionSelected.emit(this._selectedValue);
      return;
    }
  
    const allOption = this.options.find((opt: any) => {
      if (typeof opt === 'string') {
        return opt.toLowerCase() === 'all';
      }
      return opt.value === -1 || opt.label?.toLowerCase() === 'all';
    });
  
    const allValue = allOption 
      ? (typeof allOption === 'string' ? allOption : allOption?.value)
      : null;
  
    const allOptionValues = this.options.map((opt: any) =>
      typeof opt === 'string' ? opt : opt.value
    );
  
    const isSearching = this.searchEnabled && this.searchText && this.searchText.trim() !== '';
  
    if (isSearching) {
      const filteredOpts = this.filteredOptions();
      const filteredOptionValues = filteredOpts.map((opt: any) =>
        typeof opt === 'string' ? opt : opt.value
      );
  
      // Keep selections outside filtered options (don't lose previous selections)
      const selectionsOutsideFilter = previousValue.filter(v => !filteredOptionValues.includes(v));
  
      // Combine new selections inside filter + previous selections outside filter
      value = [...selectionsOutsideFilter, ...value];
  
      // Remove duplicates
      value = [...new Set(value)];
  
      this.lastClickedOptionValue = null;
    }
    else {
      // Handle special "All" option logic, if you use it.
      const activeOption = event.source.options.find(opt => opt.active);
      const lastToggledValue = activeOption?.value;
  
      const wasAllSelected = (previousValue.length === allOptionValues.length && 
        allOptionValues.every(val => previousValue.includes(val))) ||
        (allValue !== null && previousValue.includes(allValue) && previousValue.length >= allOptionValues.length);
  
      if (lastToggledValue === allValue) {
        if (value.includes(allValue)) {
          value = allValue !== null ? [allValue, ...allOptionValues.filter(v => v !== allValue)] : [...allOptionValues];
        } else {
          value = [];
        }
      }
      else if (wasAllSelected && lastToggledValue !== allValue && allValue !== null) { 
        value = [lastToggledValue];
      }
      else if (allValue !== null && value.includes(allValue) && value.length < allOptionValues.length) {
        value = value.filter(v => v !== allValue);
      }
      else if (allValue !== null && value.includes(allValue) && value.length === allOptionValues.length) {
        value = [allValue, ...allOptionValues.filter(v => v !== allValue)];
      }
      else if (allValue !== null && !value.includes(allValue) && value.length === allOptionValues.length - 1) {
        const nonAllOptions = allOptionValues.filter(v => v !== allValue);
        const allNonAllSelected = nonAllOptions.every(v => value.includes(v));
        if (allNonAllSelected) {
          value = [allValue, ...value];
        }
      }
    }
  
    let finalValue: any;
    if (this.isMultiple) {
      finalValue = value;
    } else {
      finalValue = value.length > 0 ? value[0] : null;
    }
  
    this._selectedValue = finalValue;
    this.selectedValueChange.emit(this._selectedValue);
    this.onOptionSelected.emit(this._selectedValue);
  }
  

  // Cached display text for min/max - updated explicitly for trigger refresh
  minMaxDisplayText: string = '';

  onMinOrMaxChange() {
    this.updateMinMaxDisplayText();
    this.minMaxChanged.emit({ 
      min: this.minCount, 
      max: this.maxCount 
    });
    // Force mat-select to refresh trigger
    this.refreshTrigger();
  }

  // Handle input event for real-time updates
  onMinMaxInput() {
    this.updateMinMaxDisplayText();
    this.refreshTrigger();
  }

  // Force MatSelect trigger to refresh
  private refreshTrigger(): void {
    // Use setTimeout to ensure Angular picks up the change
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      // Notify MatSelect of state change to refresh trigger
      if (this.matSelect) {
        (this.matSelect as any).stateChanges?.next();
      }
    }, 0);
  }

  // Update the cached min/max display text
  private updateMinMaxDisplayText(): void {
    const hasMin = this.minCount !== null && this.minCount !== undefined && this.minCount !== '';
    const hasMax = this.maxCount !== null && this.maxCount !== undefined && this.maxCount !== '';

    if (hasMin && hasMax) {
      this.minMaxDisplayText = `${this.minCount}min-${this.maxCount}max`;
    } else if (hasMin) {
      this.minMaxDisplayText = `${this.minCount}min-100max`;
    } else if (hasMax) {
      this.minMaxDisplayText = `0min-${this.maxCount}max`;
    } else {
      this.minMaxDisplayText = '';
    }
  }

  // Check if any checkbox options are selected
  hasOptionsSelected(): boolean {
    if (this.isMultiple) {
      const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
      return currentValue.length > 0;
    }
    return this._selectedValue !== null && this._selectedValue !== undefined && this._selectedValue !== '';
  }

  // Check if min or max value is entered
  hasMinMaxValue(): boolean {
    const hasMin = this.minCount !== null && this.minCount !== undefined && this.minCount !== '';
    const hasMax = this.maxCount !== null && this.maxCount !== undefined && this.maxCount !== '';
    return hasMin || hasMax;
  }

  // Get the text to display in trigger - shows options if selected, otherwise min/max
  getTriggerText(): string {
    if (this.hasOptionsSelected()) {
      return this.getOptionsText();
    }
    // Return min/max text directly computed (not cached) for reliability
    const hasMin = this.minCount !== null && this.minCount !== undefined && this.minCount !== '';
    const hasMax = this.maxCount !== null && this.maxCount !== undefined && this.maxCount !== '';
    
    if (hasMin && hasMax) {
      return `${this.minCount}min-${this.maxCount}max`;
    }
    if (hasMin) {
      return `${this.minCount}min-100max`;
    }
    if (hasMax) {
      return `0min-${this.maxCount}max`;
    }
    return '';
  }

  ngAfterViewInit(): void {
     this.matSelect.openedChange.subscribe((isOpen) => {
      if (isOpen) {
         setTimeout(() => this.attachScrollListener(), 0);
      }
    });
  }

  private attachScrollListener(): void {
    const panel = this.matSelect.panel?.nativeElement;
    if (!panel) return;
  
    fromEvent(panel, 'scroll')
      .pipe(
        debounceTime(100),
        filter(() => this.isAtBottom(panel as HTMLElement))
      )
      .subscribe(() => {
        console.log('Bottom of select');
        this.scrolledToBottom.emit();
      });
  }

  private isAtBottom(element: HTMLElement): boolean {
    const threshold = 10; // increase tolerance
    return element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
  }

  onInfoIconClick(event: Event): void {
    event.stopPropagation();
    if (this.usePopup && this.popupData) {
      this.openPopup.emit(this.popupData);
    }
  }

  // Check if using grouped options
  hasGroupedOptions(): boolean {
    return this.groupedOptions && this.groupedOptions.length > 0;
  }

  // Update filtered grouped options cache
  updateFilteredGroupedOptionsCache(): void {
    if (!this.groupedOptions || this.groupedOptions.length === 0) {
      this._filteredGroupedOptionsCache = [];
      return;
    }

    if (!this.searchEnabled || !this.searchText || !this.searchText.trim()) {
      this._filteredGroupedOptionsCache = [...this.groupedOptions];
      return;
    }

    const filter = this.searchText.toLowerCase().trim();
    
    this._filteredGroupedOptionsCache = this.groupedOptions
      .map(group => {
        // Check if group name matches the search
        const groupNameMatches = group.groupName.toLowerCase().includes(filter);
        
        // Filter options within the group
        const filteredOptions = group.options.filter(opt => 
          opt.label.toLowerCase().includes(filter) || 
          (opt.value && opt.value.toString().toLowerCase().includes(filter))
        );
        
        // If group name matches, show all options in that group
        // Otherwise, show only matching options
        return {
          ...group,
          options: groupNameMatches ? group.options : filteredOptions
        };
      })
      .filter(group => group.options.length > 0);
  }

  // Get filtered grouped options based on search
  filteredGroupedOptions(): GroupedOption[] {
    return this._filteredGroupedOptionsCache;
  }

  // Handle "All" selection for grouped options
  handleGroupedAllSelection(value: any[], previousValue: any[], event: MatSelectChange): any[] {
    const allGroupedValues = this.getAllGroupedOptionValues();
    const activeOption = event.source.options.find(opt => opt.active);
    const lastToggledValue = activeOption?.value;

    // Check if "All" was just clicked
    if (lastToggledValue === -1) {
      if (value.includes(-1)) {
        // Select all options
        return [-1, ...allGroupedValues];
      } else {
        // Deselect all
        return [];
      }
    }

    // If "All" was previously selected and user unchecks an individual option
    const wasAllSelected = previousValue.includes(-1);
    if (wasAllSelected) {
      // Use array comparison to find what was removed (more reliable than activeOption)
      const removedOptions = previousValue.filter(v => !value.includes(v));
      const uncheckedOption = removedOptions.find(v => v !== -1);
      
      if (uncheckedOption !== undefined) {
        // Keep all OTHER options (remove "All" and the unchecked option)
        return previousValue.filter(v => v !== -1 && v !== uncheckedOption);
      }
    }

    // Remove 'all' if not all options are selected
    let newValue = value.filter(v => v !== -1);
    
    // Check if all options are now selected (excluding 'all')
    const allSelected = allGroupedValues.every(v => newValue.includes(v));
    if (allSelected && allGroupedValues.length > 0) {
      // Add 'all' to the selection
      newValue = [-1, ...newValue];
    }

    return newValue;
  }

  // Get all options from grouped options (flat list)
  getAllGroupedOptionValues(): any[] {
    if (!this.groupedOptions || this.groupedOptions.length === 0) {
      return [];
    }
    const values: any[] = [];
    this.groupedOptions.forEach(group => {
      group.options.forEach(opt => values.push(opt.value));
    });
    return values;
  }

  // Check if all options in a group are selected
  isGroupAllSelected(group: GroupedOption): boolean {
    if (!this.isMultiple) return false;
    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    return group.options.every(opt => currentValue.includes(opt.value));
  }

  // Check if some (but not all) options in a group are selected
  isGroupPartiallySelected(group: GroupedOption): boolean {
    if (!this.isMultiple) return false;
    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    const selectedCount = group.options.filter(opt => currentValue.includes(opt.value)).length;
    return selectedCount > 0 && selectedCount < group.options.length;
  }

  // Toggle all options in a group
  onGroupToggle(group: GroupedOption, event: any): void {
    event.stopPropagation();
    if (!this.isMultiple) return;

    const currentValue = Array.isArray(this._selectedValue) ? [...this._selectedValue] : [];
    const groupValues = group.options.map(opt => opt.value);
    const allSelected = this.isGroupAllSelected(group);

    if (allSelected) {
      // Deselect all in group
      this._selectedValue = currentValue.filter(v => !groupValues.includes(v));
    } else {
      // Select all in group
      const newValues = [...currentValue];
      groupValues.forEach(val => {
        if (!newValues.includes(val)) {
          newValues.push(val);
        }
      });
      this._selectedValue = newValues;
    }

    this.selectedValueChange.emit(this._selectedValue);
    this.onOptionSelected.emit(this._selectedValue);
    this.cdr.detectChanges();
  }

  // Handle grouped option selection
  onGroupedOptionClick(optionValue: any, event: any): void {
    event.stopPropagation();
    if (!this.isMultiple) {
      this._selectedValue = optionValue;
      this.selectedValueChange.emit(this._selectedValue);
      this.onOptionSelected.emit(this._selectedValue);
      return;
    }

    const currentValue = Array.isArray(this._selectedValue) ? [...this._selectedValue] : [];
    const index = currentValue.indexOf(optionValue);

    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(optionValue);
    }

    this._selectedValue = currentValue;
    this.selectedValueChange.emit(this._selectedValue);
    this.onOptionSelected.emit(this._selectedValue);
    this.cdr.detectChanges();
  }

  // Check if a grouped option is selected
  isGroupedOptionSelected(optionValue: any): boolean {
    if (!this.isMultiple) {
      return this._selectedValue === optionValue;
    }
    const currentValue = Array.isArray(this._selectedValue) ? this._selectedValue : [];
    return currentValue.includes(optionValue);
  }
}