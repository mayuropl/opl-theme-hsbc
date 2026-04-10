import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, viewChild, Inject } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatAccordion } from '@angular/material/expansion';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants, HsnCodeLength } from 'src/app/CommoUtils/constants';
import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
import { MsmeService } from 'src/app/services/msme.service';
import { parseFormattedNumber } from 'src/app/shared/pipes/comma-formatter.pipe';
import * as _ from 'lodash';
import { FilterListItem, UserFilterRequest } from 'src/app/models/user-filter.model';

export interface FilterOption {
  name: string;
  value: any;
  selected: boolean;
  disabled?: boolean;
  count?: number;
}

export interface FilterSection {
  id: string;
  title: string;
  showSearch: boolean;
  searchText: string;
  isCollapsed: boolean;
  options: FilterOption[];
}

export interface SelectedFilterItem {
  label: string;
  value: any;
  count?: number;
}

export interface SelectedFilterGroup {
  id: string;
  title: string;
  items: SelectedFilterItem[];
}

export interface FilterCategory {
  name: string;
  id: string;
  count: number;
}

@Component({
  selector: 'app-filter-sidebar-new',
  templateUrl: './filter-sidebar-new.component.html',
  styleUrl: './filter-sidebar-new.component.scss'
})
export class FilterSidebarNewComponent implements OnInit, OnChanges {
  constants: any = Constants;
  isActive: boolean = true;
  maxDate: Date = new Date();
  minDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 5));
  fromDate: Date | null = null;
  toDate: Date | null = null;
  JSON = JSON;
  isCustomerTypeChange: boolean = false;
  @Input() filterListMaster: any[];
  @Input() originalFilterList: string;
  @Input() isProcessing: boolean = false;
  @Input() customerTypeInActive: boolean = false;
  @Input() customerType: number;
  @Input() filterData: any;
  @Input() isFromSaveFilterPopup: any;
  @Input() savedFilter:FilterListItem;
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<any[]>();
  @Output() reset = new EventEmitter<any>();
  @Output() toggleChanged = new EventEmitter<boolean>();

  accordion = viewChild.required(MatAccordion);

  selectedCategoryIndex: number = -1;
  selectedCategoryCount: number = 1;
  private searchSubject = new Subject<any>();
  highlightedCategoryIndex: number = -1; // Track which category to highlight

  filterCategories: FilterCategory[] = [];

  selectedFilterGroups: SelectedFilterGroup[] = [];

  constructor(
    private msmeService: MsmeService,
    private commonService: CommonService,
    private existingProspectsDropDownService: ExistingProspectsDropDownService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialize filterListMaster from dialog data if available
    if (this.data?.filterListMaster) {
      this.filterListMaster = this.data.filterListMaster;
      this.originalFilterList = JSON.stringify(this.data.filterListMaster);
    }

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

  ngOnInit(): void {
    this.filterListMaster = this.data.filterListMaster;
    this.data.isProcessing.subscribe(status => {
      this.isProcessing = status;
    });
    if (this.data?.customerTypeInActive !== undefined) {
      this.customerTypeInActive = this.data.customerTypeInActive;
    }
    if (this.data?.customerType !== undefined) {
      this.customerType = this.data.customerType;
    }
    if (this.data?.isFromSaveFilterPopup !== undefined) {
      this.isFromSaveFilterPopup = this.data.isFromSaveFilterPopup;
    }
    if (this.data?.savedFilter !== undefined) {
      this.savedFilter = this.data.savedFilter;
    }

    

    this.isActive = !this.customerTypeInActive;
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
      } else if(filter1.filterName == 'Company Type') {
        filter1.insightTwoFilter.forEach(filter2 => {
          if (filter2.filterTwoName == 'Listing Status') {
            if (filter2.json.keys) {
              filter2.json.keys.forEach(key => {
              if (Array.isArray(key.value))
                key.value= this.JSON.stringify(key.value);
              });
            }
          }
          if (filter2.json.value && Array.isArray(filter2.json.value) ) {
            filter2.json.value = this.JSON.stringify(filter2.json.value);
          }
        });
      }
    });
    this.initializeFilterCategories();
    this.updateSelectedCategoryCount();
    this.updateSelectedFilterGroups();

    // Check if a specific category should be selected (from edit action)
    if (this.data?.selectedCategoryIndex !== undefined && this.data.selectedCategoryIndex >= 0) {
      // Select the specified category
      this.selectCategory(this.data.selectedCategoryIndex);
      // Highlight it to draw attention
      this.highlightedCategoryIndex = this.data.selectedCategoryIndex;
      // Remove highlight after animation completes
      setTimeout(() => {
        this.highlightedCategoryIndex = -1;
      }, 3000);
    } else {
      // Auto-select the first filter category that has applied filters
      this.autoSelectFirstAppliedFilter();
    }
  }

 onCustomerTypeToggle(event: any): void {
    const isActive = event.checked;
    this.customerTypeInActive = !isActive;
    this.isActive = isActive;
    console.log('Customer Type Toggle - isActive:', isActive, 'isCustomerTypeInActive:', this.customerTypeInActive);
    // Update the global state
    this.commonService.updateCustomerInActive(this.customerType - 1, this.customerTypeInActive);
    this.isCustomerTypeChange = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerTypeInActive']) {
      this.isActive = !this.customerTypeInActive;
    }
    if (changes['filterListMaster'] && changes['filterListMaster'].currentValue) {
      this.initializeFilterCategories();

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

  initializeFilterCategories(): void {
    if (!this.filterListMaster || this.filterListMaster.length === 0) return;
    this.filterListMaster = this.filterListMaster.filter(filter1 => this.shouldShowItem(filter1));
    this.filterCategories = this.filterListMaster
      .map(filter1 => ({
        name: filter1.filterName,
        id: filter1.filterName.toLowerCase().replace(/\s+/g, '_'),
        count: filter1.count || 0
      }));
  }

  autoSelectFirstAppliedFilter(): void {
    // Find the first filter category that has applied filters (count > 0)
    if (!this.filterListMaster || this.filterListMaster.length === 0) return;

    const firstAppliedIndex = this.filterListMaster.findIndex(filter1 => filter1.count > 0);

    if (firstAppliedIndex >= 0) {
      // Auto-select the first filter with applied selections
      this.selectCategory(firstAppliedIndex);
    }
  }

  selectCategory(index: number): void {
    this.selectedCategoryIndex = index;
  }

  toggleSection(section: FilterSection): void {
    section.isCollapsed = !section.isCollapsed;
  }

  onSectionSearch(section: FilterSection): void {
    // TODO: Implement search within section
    console.log('Searching in section:', section.title, 'Text:', section.searchText);
  }

  onOptionChange(section: FilterSection, option: FilterOption): void {
    // Handle "All" option logic
    if (option.value === 'all' && option.selected) {
      section.options.forEach(opt => {
        if (opt.value !== 'all') {
          opt.selected = true;
        }
      });
    } else if (option.value === 'all' && !option.selected) {
      section.options.forEach(opt => {
        opt.selected = false;
      });
    } else {
      // Check if all non-"All" options are selected
      const allOption = section.options.find(opt => opt.value === 'all');
      if (allOption) {
        const nonAllOptions = section.options.filter(opt => opt.value !== 'all');
        const allSelected = nonAllOptions.every(opt => opt.selected);
        allOption.selected = allSelected;
      }
    }

    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
  }

  clearAllFilters(selectedCategoryIndex): void {
    this.filterListMaster[selectedCategoryIndex].insightTwoFilter.forEach(filter2 => {
      filter2.searchValue = null;
      if (filter2.type === 'checkbox') {
        if (filter2.json.isFetchFromAPi) {
          filter2.json.keys=[];
        } else if (filter2.json.keys) {
          filter2.json.keys.forEach(key => {
            key.selected = false;
            if (key.subKeys) {
              key.subKeys.forEach(subKey => subKey.selected = false);
            }
          });
          filter2.json.keys.forEach(item => {item.isVisible = true;item.selected=false});
        }
        filter2.selected = [];
      } else if (filter2.type === 'radioButton') {
        filter2.json.value = null;
      } else if (filter2.type === 'minMax') {
        filter2.json.min = null;
        filter2.json.max = null;
        filter2.json.minRaw = null;
        filter2.json.maxRaw = null;
        filter2.json.validationError = null;
      } else if (filter2.type === 'date' || filter2.type === 'dateRange') {
        filter2.json.fromDate = null;
        filter2.json.toDate = null;
      }
      filter2.json.count = 0;
    });
    this.filterListMaster[selectedCategoryIndex].count = 0;
    this.filterCategories[selectedCategoryIndex].count = 0;
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
  }

  updateSelectedCategoryCount(): void {
    let count = 0;
    if (this.filterListMaster) {
      this.filterListMaster.forEach(filter1 => {
        if (filter1.count > 0) {
          count++;
        }
      });
    }
    this.selectedCategoryCount = count || 0;
  }

  updateSelectedFilterGroups(): void {
    this.selectedFilterGroups = [];

    if (!this.filterListMaster || this.filterListMaster.length === 0) return;

    // Iterate through all filter categories
    this.filterListMaster.forEach(filter1 => {
      if (!filter1.insightTwoFilter) return;

      filter1.insightTwoFilter.forEach(filter2 => {
        if (!filter2.json || filter2.json.count === 0) return;

        const items: SelectedFilterItem[] = [];

        // Handle checkbox type filters
        if (filter2.type === 'checkbox' && filter2.selected && filter2.selected.length > 0) {
          let checkboxList = filter2.json.keys;
          // For business line with hierarchical structure
          if (filter2.keyName === 'businessLine' || filter2.keyName === 'AvailingProducts') {
            if (checkboxList) {
              checkboxList.forEach(parent => {
                if (parent.selected) {
                  items.push({
                    label: parent.name,
                    value: parent.value
                  });
                }
                if (parent.subKeys) {
                  parent.subKeys.forEach(child => {
                    if (child.selected) {
                      items.push({
                        label: child.name,
                        value: child.value
                      });
                    }
                  });
                }
              });
            }
          } else {
            // Regular checkboxes
            if (checkboxList) {
              checkboxList.forEach(key => {
                if (key.selected) {
                  items.push({
                    label: key.name,
                    value: key.value
                  });
                }
              });
            }
          }
        }
        // Handle radio button type filters
        else if (filter2.type === 'radioButton' && filter2.json.value && filter2.json.value !== 'All') {
          const selectedKey = filter2.json.keys?.find(k => JSON.stringify(k.value) === JSON.stringify(filter2.json.value));
          if (selectedKey) {
            items.push({
              label: selectedKey.name,
              value: selectedKey.value
            });
          }
        }
        // Handle min/max type filters
        else if (filter2.type === 'minMax') {
          const hasMin = filter2.json.min !== null && filter2.json.min !== '' && filter2.json.min !== undefined;
          const hasMax = filter2.json.max !== null && filter2.json.max !== '' && filter2.json.max !== undefined;

          if (hasMin || hasMax) {
            const minVal = hasMin ? filter2.json.min : '-';
            const maxVal = hasMax ? filter2.json.max : '-';
            items.push({
              label: `${minVal} to ${maxVal}`,
              value: { min: filter2.json.min, max: filter2.json.max }
            });
          }
        }
        // Handle date type filters
        else if (filter2.type === 'date') {
          const hasFrom = filter2.json.fromDate !== null && filter2.json.fromDate !== undefined;
          const hasTo = filter2.json.toDate !== null && filter2.json.toDate !== undefined;

          if (hasFrom || hasTo) {
            const fromVal = hasFrom ? filter2.json.fromDate : '-';
            const toVal = hasTo ? filter2.json.toDate : '-';
            items.push({
              label: `${fromVal} to ${toVal}`,
              value: { from: filter2.json.fromDate, to: filter2.json.toDate }
            });
          }
        }

        // Add to selected filter groups if there are items
        if (items.length > 0) {
          this.selectedFilterGroups.push({
            id: filter2.filterTwoName?.toLowerCase().replace(/\s+/g, '_') || '',
            title: filter2.filterTwoName || '',
            items: items
          });
        }
      });
    });
  }

  getTotalSelectedCount(): number {
    return this.selectedFilterGroups.reduce((total, group) => total + group.items.length, 0);
  }

  editGroup(group: SelectedFilterGroup): void {
    // Find the filter category that contains this group
    let categoryIndex = -1;
    this.filterListMaster.forEach((filter1, index) => {
      filter1.insightTwoFilter?.forEach(filter2 => {
        // Standardize the name once per iteration
        const normalizedName = filter2.filterTwoName?.toLowerCase().replace(/\s+/g, '_');

        if (normalizedName === group.id) {
          // 1. Capture the parent index (previously your .findIndex)
          categoryIndex = index;

          // 2. Update the collapsed state (previously your .forEach)
          if (filter2.isCollapsed) {
            filter2.isCollapsed = false;
          }
        }
      });
    });

    if (categoryIndex >= 0) {
      // Select the category to show its filters
      this.selectCategory(categoryIndex);
    }
  }

  deleteGroup(group: SelectedFilterGroup): void {
    // Find and clear all selections for this filter group
    this.filterListMaster.forEach(filter1 => {
      if (!filter1.insightTwoFilter) return;

      filter1.insightTwoFilter.forEach(filter2 => {
        const filterId = filter2.filterTwoName?.toLowerCase().replace(/\s+/g, '_');
        if (filterId === group.id) {
          // Clear selections based on filter type
          if (filter2.type === 'checkbox') {
            if (filter2.json.keys) {
              filter2.json.keys.forEach(key => {
                key.selected = false;
                if (key.subKeys) {
                  key.subKeys.forEach(subKey => subKey.selected = false);
                }
              });
            }
            filter2.selected = [];
          } else if (filter2.type === 'radioButton') {
            filter2.json.value = null;
          } else if (filter2.type === 'minMax') {
            filter2.json.min = null;
            filter2.json.max = null;
            filter2.json.minRaw = null;
            filter2.json.maxRaw = null;
            filter2.json.validationError = null;
          } else if (filter2.type === 'date') {
            filter2.json.fromDate = null;
            filter2.json.toDate = null;
          }

          // Update counts
          const oldCount = filter2.json.count || 0;
          filter1.count = (filter1.count || 0) - oldCount;
          filter2.json.count = 0;
          this.filterCategories[this.selectedCategoryIndex].count = filter1.count;
        }
      });
    });
    this.initializeFilterCategories();
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
  }

  removeItem(group: SelectedFilterGroup, item: SelectedFilterItem): void {
    // Find and remove the specific item
    this.filterListMaster.forEach(filter1 => {
      if (!filter1.insightTwoFilter) return;

      filter1.insightTwoFilter.forEach(filter2 => {
        const filterId = filter2.filterTwoName?.toLowerCase().replace(/\s+/g, '_');
        if (filterId === group.id) {
          // Handle different filter types
          if (filter2.type === 'checkbox') {
            let checkboxList = filter2.json.keys;;
            if (checkboxList) {
              // Check parent keys
              if (item.value == -1 || item.value=="All") {
                filter1.count = filter1.count - checkboxList.length;
                filter2.json.count = 0;
                checkboxList.forEach(element => {
                  element.selected = false;
                  filter2.selected = [];
                });
              } else {
                checkboxList.forEach(key => {
                  if ((key.value === item.value || (key.value==-1 || key.value=="All")) && key.selected) {
                    key.selected = false;
                    filter1.count = (filter1.count || 0) - 1;
                    filter2.json.count = (filter2.json.count || 0) - 1;

                    // Remove from selected array
                    const index = filter2.selected?.indexOf(item.value);
                    if (index !== undefined && index > -1) {
                      filter2.selected.splice(index, 1);
                    }
                    const indexAll = filter2.selected?.indexOf(key.value);
                    if (indexAll !== undefined && indexAll > -1) {
                      filter2.selected.splice(indexAll, 1);
                    }
                  }


                  // Check sub keys
                  if (key.subKeys) {
                    key.subKeys.forEach(subKey => {
                      if (subKey.value === item.value && subKey.selected) {
                        subKey.selected = false;
                        filter1.count = (filter1.count || 0) - 1;
                        filter2.json.count = (filter2.json.count || 0) - 1;

                        // Remove from selected array
                        const index = filter2.selected?.indexOf(item.value);
                        if (index !== undefined && index > -1) {
                          filter2.selected.splice(index, 1);
                        }
                      }
                    });
                  }
                });
              }

            }
          } else if (filter2.type === 'radioButton') {
            filter2.json.value = null;
            filter1.count = (filter1.count || 0) - 1;
            filter2.json.count = 0;
          } else if (filter2.type === 'minMax' || filter2.type === 'date') {
            // For min/max and date, removing the item means clearing the entire filter
            if (filter2.type === 'minMax') {
              filter2.json.min = null;
              filter2.json.max = null;
              filter2.json.minRaw = null;
              filter2.json.maxRaw = null;
              filter2.json.validationError = null;
            } else {
              filter2.json.fromDate = null;
              filter2.json.toDate = null;
            }
            filter1.count = (filter1.count || 0) - 1;
            filter2.json.count = 0;
          }
        }
      });
    });
    this.initializeFilterCategories();
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
  }

  closeFilter(): void {
    this.close.emit();
  }

  onCancel(): void {
    this.close.emit();
  }

  onApplyFilters(): void {
    this.onApply();
  }

  // Methods from original filter-sidebar component
  onSearchChange(parentFilter: any, filter2: any) {
    if (filter2.isCollapsed) {
      filter2.isCollapsed = false;
    }
    this.searchSubject.next({ parentFilter, filter2 });
  }

  filterCheckBox(filter2) {
    let searchValue = filter2.searchValue;
    if (filter2.isCollapsed) {
      filter2.isCollapsed = false;
    }
    if (searchValue) {
      filter2.json.keys.forEach(item => {
        item.isVisible = item.name.toUpperCase().includes(searchValue.toUpperCase().trim());
      });
      filter2.noResultsFound = !filter2.json.keys.some(item => item.isVisible);
    } else {
      filter2.json.keys.forEach(item => {
        item.isVisible = true;
      });
    }
  }

  checkCountRadioButton(filter1, filter2) {
    const hasValue = filter2.json.value != undefined && filter2.json.value != null && filter2.json.value !== 'All';

    if (hasValue && filter2.json.count == 0) {
      // First time selecting a value
      filter1.count = filter1.count + 1;
      filter2.json.count = 1;
    } else if (!hasValue && filter2.json.count > 0) {
      // Deselecting (selecting "All" or null)
      filter1.count = filter1.count - 1;
      filter2.json.count = 0;
    }
    // If hasValue and count is already 1, just switching between options - no count change needed

    // Update selected filter groups display
    this.filterCategories[this.selectedCategoryIndex].count = filter1.count;
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
  }

  onRadioChange(event: any, filter1: any, filter2: any): void {
    // The model is already updated by ngModel at this point

    // Ensure the value is properly set
    if (event && event.value !== undefined) {
      filter2.json.value = event.value;
    }

    // Just update the counts and display
    this.checkCountRadioButton(filter1, filter2);
  }

  onKeysDualChange(filter1: any, filter2: any) {
    if (filter2?.json) {
      if (filter2.json.keys && filter2.json.keys.length > 0) {
        filter1.count = filter1.count - filter2.json.count;
        filter2.json.count = 0;
      }
      filter2.json.keys = [];
      filter2.selected = [];
      filter2.noResultsFound = false;
      if (filter2.searchValue?.trim()) {
        this.onSearchChange(filter1, filter2);
      }
    }
  }

  private updateMinMaxCount(filter1: any, filter2: any): void {
    const hasMin = filter2.json.min !== null && filter2.json.min !== '' && filter2.json.min !== undefined;
    const hasMax = filter2.json.max !== null && filter2.json.max !== '' && filter2.json.max !== undefined;
    const hasValue = hasMin || hasMax;

    if (hasValue && filter2.json.count === 0) {
      filter1.count++;
      filter2.json.count = 1;
    } else if (!hasValue && filter2.json.count === 1) {
      filter1.count--;
      filter2.json.count = 0;
    }
  }

  checkCountCheckBox(event: MatCheckboxChange, filter1, filter2, itemId, isSingleSelect?: boolean) {
    let checkboxList = filter2.json.keys;
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

    // Update selected filter groups display
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
    this.filterCategories[this.selectedCategoryIndex].count = filter1.count;
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
    const anyChildSelected = parentItem.subKeys?.some(child => child.selected);
    if (anyChildSelected) {
      parentItem.selected = true;
    } else {
      parentItem.selected = false;
    }
    this.recalculateBusinessLineCounts(filter1, filter2);
  }

  recalculateBusinessLineCounts(filter1: any, filter2: any) {
    const oldCount = filter2.json.count || 0;
    let newCount = 0;

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

    // Update selected filter groups display
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
  }

  getListFromApi(parentFilter: any, filter2: any) {
    let searchValue = filter2.searchValue;
    if (!searchValue) {
      filter2.json.keys = [];
      this.updateSelectedFilterGroups();
      this.updateSelectedCategoryCount();
      this.initializeFilterCategories();
      return
    };
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
        filter2.noResultsFound = response.data?.length === 0;
        let i = 1;
        filter2.json.keys.forEach(element => {
          element.sNo=i;
          i++;
          if (filter2.json.isAutoSelect) {
            element.selected = true;
          }
        });

        if (filter2.json.isAutoSelect) {
          this.filterListMaster = this.existingProspectsDropDownService.selectAllCheckbox(this.filterListMaster, filter2);
          this.updateSelectedFilterGroups();
          this.updateSelectedCategoryCount();
          this.initializeFilterCategories();
        }
        filter2?.selected?.forEach(element => {
          const i = filter2.json.keys.findIndex(x => x.name === element);
          filter2.json.keys[i].selected = true;
        });
      } else {
        this.commonService.errorSnackBar(response.message)
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
    return `${y}-${m}-${d}`;
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

    // Update selected filter groups display
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
    this.initializeFilterCategories();
  }

  onFocus(type: 'from' | 'to', filter1: any, filter2: any) {
    if (filter1.filterName == 'New-age Economy') {
      this.onDatepickerOpened(type, filter1, filter2);
    }
  }

  onModelChanged(type: 'from' | 'to', datePicker: any, value: any) {
    if (!value) {
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

  private resetFilterCount(parentFilter: any, filter2: any): void {
    const previousCount = filter2.json.count || 0;
    if (previousCount > 0) {
      parentFilter.count -= previousCount;
      filter2.json.count = 0;
    }
    filter2.selected = [];
    filter2.noResultsFound = false;
  }

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

  onMinBlur(filter1: any, filter2: any): void {
    if (filter2.json.min || filter2.json.min === 0) {
      const rawValue = parseFormattedNumber(filter2.json.min?.toString());

      if (rawValue !== null && !isNaN(rawValue)) {
        filter2.json.minRaw = rawValue;
        filter2.json.min = this.formatNumberWithCommas(rawValue);
      } else {
        filter2.json.min = null;
        filter2.json.minRaw = null;
      }
    } else {
      filter2.json.minRaw = null;
    }

    this.validateMinMax(filter2);
    this.updateMinMaxCount(filter1, filter2);
    this.filterCategories[this.selectedCategoryIndex].count = filter1.count;
    // Update selected filter groups display
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
  }

  onMaxBlur(filter1: any, filter2: any): void {
    if (filter2.json.max || filter2.json.max === 0) {
      const rawValue = parseFormattedNumber(filter2.json.max?.toString());

      if (rawValue !== null && !isNaN(rawValue)) {
        filter2.json.maxRaw = rawValue;
        filter2.json.max = this.formatNumberWithCommas(rawValue);
      } else {
        filter2.json.max = null;
        filter2.json.maxRaw = null;
      }
    } else {
      filter2.json.maxRaw = null;
    }

    this.validateMinMax(filter2);
    this.updateMinMaxCount(filter1, filter2);
    this.filterCategories[this.selectedCategoryIndex].count = filter1.count;
    // Update selected filter groups display
    this.updateSelectedFilterGroups();
    this.updateSelectedCategoryCount();
  }

  onMinFocus(filter2: any): void {
    // Keep the formatted value with commas
  }

  onMaxFocus(filter2: any): void {
    // Keep the formatted value with commas
  }

  hasFilterError(filter1: any): boolean {
    return filter1.insightTwoFilter?.some(filter2 =>
      filter2.type === 'minMax' && filter2.json?.validationError
    ) || false;
  }

  hasSubFilterError(filter2: any): boolean {
    return filter2.type === 'minMax' && !!filter2.json?.validationError;
  }

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

  sanitizeNumericInput(value: string, allowNegative: boolean = false): string {
    if (!value) return '';

    let sanitized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '');

    if (!allowNegative) {
      sanitized = sanitized.replace(/-/g, '');
    } else {
      const hasNegative = sanitized.startsWith('-');
      sanitized = sanitized.replace(/-/g, '');
      if (hasNegative) {
        sanitized = '-' + sanitized;
      }
    }

    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    return sanitized;
  }

  onMinInput(filter2: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value || '';

    const formatted = this.formatInputRealTime(currentValue, filter2.json.allowNegative, input);

    filter2.json.min = formatted;
    input.value = formatted;

    const rawValue = parseFormattedNumber(formatted);
    filter2.json.minRaw = (rawValue !== null && !isNaN(rawValue)) ? rawValue : null;

    this.validateMinMax(filter2);
  }

  onMaxInput(filter2: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value || '';

    const formatted = this.formatInputRealTime(currentValue, filter2.json.allowNegative, input);

    filter2.json.max = formatted;
    input.value = formatted;

    const rawValue = parseFormattedNumber(formatted);
    filter2.json.maxRaw = (rawValue !== null && !isNaN(rawValue)) ? rawValue : null;

    this.validateMinMax(filter2);
  }

  private formatInputRealTime(value: string, allowNegative: boolean, input: HTMLInputElement): string {
    const cursorPos = input.selectionStart || 0;
    const oldLength = value.length;
    const commasBefore = (value.substring(0, cursorPos).match(/,/g) || []).length;

    let sanitized = this.sanitizeNumericInput(value, allowNegative);

    if (!sanitized || sanitized === '-' || sanitized === '.') {
      return sanitized;
    }

    const parts = sanitized.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : null;

    const isNegative = integerPart.startsWith('-');
    const absInteger = isNegative ? integerPart.substring(1) : integerPart;
    const formattedInteger = absInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let formatted = (isNegative ? '-' : '') + formattedInteger;
    if (decimalPart !== null) {
      formatted += '.' + decimalPart;
    }

    const newLength = formatted.length;
    const commasAfter = (formatted.substring(0, cursorPos + (newLength - oldLength)).match(/,/g) || []).length;
    const newCursorPos = cursorPos + (commasAfter - commasBefore);

    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    return formatted;
  }

  onReset() {
    this.reset.emit();
  }

  onApply() {
    const errorFilters: string[] = [];

    this.filterListMaster.forEach(filter1 => {
      filter1.insightTwoFilter?.forEach(filter2 => {
        if (filter2.type === 'minMax' && filter2.json?.validationError) {
          errorFilters.push(filter2.filterTwoName || filter1.filterName);
        }
      });
      if(filter1.filterName == 'Company Type') {
        filter1.insightTwoFilter.forEach(filter2 => {
          if (filter2.filterTwoName == 'Listing Status' && filter2.json.value) {
            filter2.json.value = this.JSON.parse(filter2.json.value);
          }
        });
      }
    });

    if (errorFilters.length > 0) {
      this.commonService.errorSnackBar(`Please correct validation errors in: ${errorFilters.join(', ')}`);
      return;
    }
    if (this.isFromSaveFilterPopup) {
      this.updateUserFilter();
    }
    let data :any = {"filterListMaster" : this.filterListMaster,"customerTypeInActive":this.customerTypeInActive}
    this.apply.emit(data);
  }

  updateUserFilter(): void {
    const request: UserFilterRequest = {
      filterName: this.savedFilter.filterName.trim(),
      filterJson: JSON.stringify(this.filterListMaster),
      customerTypeId: this.savedFilter.customerTypeId
    };
    this.msmeService.updateUserFilter(this.savedFilter.id, request).subscribe({
      next: (response) => {
        this.commonService.successSnackBar('Filter updated successfully');
      },
      error: (error) => {
        this.commonService.errorSnackBar(error.message || 'Failed to update filter');
      }
    });
  }

  get isSaveDisabled(): boolean {
    return JSON.stringify(this.filterListMaster) === this.originalFilterList;
  }
}
