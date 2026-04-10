import { Component, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { SaveViewPopupComponent } from 'src/app/Popup/save-view-popup/save-view-popup.component';

@Component({
  selector: 'app-risk-dashboard',
  templateUrl: './risk-dashboard.component.html',
  styleUrl: './risk-dashboard.component.scss'
})
export class RiskDashboardComponent {
  scrolled: boolean = false;
  speedScore = 80;
  readingSpeed: Number;
  niddleSpeed: Number;
  toppingsControl = new FormControl([]);
  toppingList: string[] = [
    'Regulatory Risk',
    'Regulatory Risk',
    'Regulatory Risk'
  ];
  constructor(public dialog: MatDialog, ) {
    this.getSpeed();
   }

  // save view popup S
  Save_view_popup(): void {
    const dialogRef = this.dialog.open(SaveViewPopupComponent, {
      data: {},
      panelClass: ['popupMain_design'],
    });
   }
  // save view popup E
  // Month select S
  modelDate = '';

  onOpenCalendar(container) {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('month');
  }
  // Month select E

  // Mutlti select topping S
  onToppingRemoved(topping: string) {
    const toppings = this.toppingsControl.value as [];
    this.removeFirst(toppings, topping);
    this.toppingsControl.setValue(toppings); // To trigger change detection
  }
  private removeFirst<T>(array: T[], toRemove: T): void {
    const index = array.indexOf(toRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }
  // Mutlti select topping E

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 100;
  }

  //  Speed meter chart S
  updateSpeed() {
    this.readingSpeed = Math.round((this.speedScore * 180) / 100) - 45;
    this.niddleSpeed = Math.round((this.speedScore * 180) / 100) - 90;
  }

  getSpeed() {
    this.speedScore = this.speedScore;
    this.updateSpeed();
  }
  //  Speed meter chart E


  Highcharts: typeof Highcharts = Highcharts;
  // Overall Risk Score Timeline chart S

  Overall_Risk_Score_Timeline: any = {
    chart: {
      type: 'spline',
      height: 300,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [
        'Jan 24',
        'Feb 24',
        'Mar 24',
        'Apr 24',
        'May 24',
        'Jan 24',
        'Jul 24',
        'Aug 24',
        'Sep 24',
        'Oct 24',
        'Nov 24',
        'Dec 24',

      ],
      lineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickLength: 0,
      allowDecimals: false,
      accessibility: {
        rangeDescription: 'Range: 07 Sep to 18 Sep.',
      },
    },
    yAxis: {
      title: {
        text: 'Risk Score',
      },

      labels: {
        useHTML: true,
        formatter: function () {
          if (this.value > 100) {
            return 'Critical';
          } if (this.value > 75) {
            return 'High';
          } if (this.value > 50) {
            return 'Medium';
          }
          if (this.value > 25) {
            return 'Low';
          } else {
            return 'No Risk';
          }
        }
      },
      gridLineDashStyle: 'longdash',
    },
    plotOptions: {
      areaspline: {
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 0,
          lineWidth: 1,
          lineColor: null,
        },
      },
      series: {
        animation: {
          duration: 2000,
        },
        lineWidth: 4,
      },
    },
    legend: {
      enabled: false,
      align: 'right',
      verticalAlign: 'top',
      itemMarginTop: 10,
      itemMarginBottom: 20,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      shared: true,
      stickOnContact: true,
      formatter: function () {
        return `
          <div class="custom-long-tooltip">
            <p>Jan 24</p>
            <div class="tooltip-row">
              <span class="label darkgreen_label">No Risk</span>
            </div>
            <div class="tooltip-row">
              <span class="value view-link tooltip-action-risk-score-timeline cursor_pointer">View Alerts</span>
            </div>
          </div>
        `;
      }
    },
    series: [
      {
        data: [0, 40, 50, 60, 75, 70, 45, 10, 20, 50, 100, 40],
        name: 'Successful',

        color: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 0,
          },
          stops: [
            [0, '#047500'],
            [0.25, '#7ABD7E'],
            [0.5, '#F8D66E'],
            [0.75, '#FF6961'],
            [1, '#842002'],
          ],
        },

      },

    ],
  };
  // Overall Risk Score Timeline chart E

  // Companies by Risk Score option S

  Companies_RiskScore_Highcharts: any = {
    chart: {
      plotBorderWidth: null,
      plotShadow: false,
      height: 300,
    },
    title: {
      text: '',
      align: 'center',
      verticalAlign: 'middle',
      y: 0,
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#FFFFFF',
      borderColor: '#E7E7E7',
      borderRadius: 4,
      borderWidth: 1,
      pointFormat: '<b>{point.percentage:}</b>',
      useHTML: true,
      followPointer: false,
      outside: true,
      zIndex: 100,
      formatter: function () {
        return `<div class="custom-tooltip" style="pointer-events: auto;">
                <span class="date_txt">Dec 24</span><br>
                <div class="title_wrap">
                <span>
                <i class="fas fa-circle critical_text"></i> 50% Low
                </span>
                  <span class="green_text ml-2 tooltip-action-risk-severity-pie cursor_pointer"><u>295 alerts</u></span>
                </div>
            </div>`;
      }
    },
    plotOptions: {
      pie: {
        shadow: false,
        allowPointSelect: true,
        center: ['50%', '50%'],
        size: '100%',
        innerSize: '80%',
        dataLabels: {
          enabled: true,
          useHTML: true,
          distance: -10,
          zIndex: 1,
          formatter: function () {
            return `<div class="custom-chart-label">
                          <strong><i class="fas fa-circle critical_text"></i> ${this.name} (${this.y})</strong><br/>
                         </div>`;
          }
        },
      },
      series: {
        animation: {
          duration: 2000,
        },
        states: {
          hover: {
            enabled: true, // ✅ disables hover effect
          },
        },
      },
    },
    series: [
      {
        type: 'pie',
        colors: ['#7ABD7E', '#F8D66E', '#FF6961', '#872000'],
        data: [
          ['50% Low (10)', 10],
          ['14% Medium (4)', 50],
          ['14% Medium (4)', 10],
          ['15% Severe (5)', 50],
        ],
        borderWidth: 0,
      },
    ],
  }
  // Companies by Risk Score option E

  // Companies by Risk Score - Timeline S

  Companies_RiskScoreTimeline_Highcharts: any = {
    chart: {
      type: 'areaspline',
      height: 300,
      zooming: {
        type: 'y',
        enabled: true,
        mouseWheel: {
          enabled: true,
          type: 'scroll'
        }
      },
      events: {
        load: function () {
          const chart = this;

          chart.series.forEach(series => {
            series.points.forEach(point => {
              const label = point.dataLabel?.element;

              if (label) {
                label.style.cursor = 'pointer';

                label.addEventListener('mouseover', () => {
                  const xIndex = point.x;

                  chart.series.forEach(s => {
                    s.points.forEach(p => {
                      if (p.x === xIndex && p.dataLabel) {
                        p.dataLabel.element.style.opacity = 1;
                      } else if (p.dataLabel) {
                        p.dataLabel.element.style.opacity = 0.1;
                      }
                    });
                  });
                });

                label.addEventListener('mouseout', () => {
                  chart.series.forEach(s => {
                    s.points.forEach(p => {
                      if (p.dataLabel) {
                        p.dataLabel.element.style.opacity = 1;
                      }
                    });
                  });
                });
              }
            });
          });
        }
      }
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [

      ],
      lineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickLength: 0,
      allowDecimals: true,
      accessibility: {
        rangeDescription: 'Range: 07 Sep to 18 Sep.',
      },
    },
    yAxis: {
      title: {
        text: 'No. of Alerts',
      },
      gridLineDashStyle: 'longdash',
    },
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: false
          }
        },
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: false
            }
          }
        },
        dataLabels: {
          enabled: true,
          borderRadius: 5,
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: '#AAA',
          padding: 4,
          inside: true,
          verticalAlign: 'middle',
          crop: false,
          overflow: 'justify',
          align: 'center',
          allowOverlap: false,
        },
        animation: {
          duration: 100,
        },

      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      shared: true,
      stickOnContact: true,
      formatter: function () {
        return `
                <div class="custom-long-tooltip">
                  <p>${this.point.category}</p>
                  <div class="tooltip-row">
                    <span class="label darkred_label">Critical Risk</span>
                    <span class="value tooltip-action-risk-severity-timeline cursor_pointer">0 alerts</span>
                  </div>
                  <div class="tooltip-row">
                    <span class="label orange_label">High Risk</span>
                    <span class="value tooltip-action-risk-severity-timeline cursor_pointer">0 alerts</span>
                  </div>
                  <div class="tooltip-row">
                    <span class="label yellow_label">Medium Risk</span>
                    <span class="value tooltip-action-risk-severity-timeline cursor_pointer">0 alerts</span>
                  </div>
                  <div class="tooltip-row">
                    <span class="label green_label">Low Risk</span>
                    <span class="value tooltip-action-risk-severity-timeline cursor_pointer">0 alerts</span>
                  </div>
                  <div class="tooltip-row">
                    <span class="value view-link tooltip-action-risk-severity-timeline cursor_pointer">View Alerts</span>
                  </div>
                </div>
              `;
      }
    },
    series: [

      {
        data: [7, 7, 7, 9, 9, 8, 8, 8, 8, 8, 7, 8],
        name: 'Critical',
        color: '#872000',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(135, 32, 0, 0.4)'],
            [1, 'rgba(135, 32, 0, 0)']
          ]
        },
        dataLabels: {
          borderColor: '#872000',
        }
      },
      {
        data: [6.5, 6, 6, 6, 6, 6, 6, 5, 5, 5, 6, 5],
        name: 'High',
        color: '#FF6961',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(254, 105, 97, 0.4)'],
            [1, 'rgba(254, 105, 97, 0)']
          ]
        },
        dataLabels: {
          borderColor: '#FF6961',
        }
      },
      {
        data: [6, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4],
        name: 'Medium',
        color: '#F8D66E',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(248, 214, 110, 0.4)'],
            [1, 'rgba(248, 214, 110, 0)']
          ]
        },
        dataLabels: {
          borderColor: '#F8D66E',
        }
      },
      {
        data: [4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 2],
        name: 'Low',
        color: '#7ABD7E',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(122, 189, 126, 0.4)'],
            [1, 'rgba(122, 189, 126, 0)']
          ]
        },
        dataLabels: {
          borderColor: '#7ABD7E',
        }
      },
    ],
  };
  // Companies by Risk Score - Timeline chart E

  // Companies by Risk Category - Timeline S

  CompaniesRiskCategory_Highcharts: any = {
    chart: {
      type: "bar"
    },
    title: {
      text: ""
    },

    xAxis: {
      categories: ["Regulatory", "Compliance", "Financial Distress", "Legal Violation", "Operational & Governance"],
      title: {
        text: null
      },
      lineWidth: 1,
      lineColor: "#DCDFE0",
      tickWidth: 1,
      gridLineWidth: 0,
      lineDashStyle: "Dash",
      tickLength: 0,
    },
    yAxis: {
      min: 0,
      tickPositions: [0, 5000, 10000],
      title: {
        text: "",
        align: "high"
      },
      labels: {
        overflow: "justify",
        formatter: function () {
          return this.value.toString();
        }
      },
      lineWidth: 1,
      lineColor: "#DCDFE0",
      tickWidth: 1,
      gridLineWidth: 0,
      lineDashStyle: "Dash",
      tickLength: 0,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      shared: true,
      stickOnContact: true,
      formatter: function () {
        return `
            <div class="custom-long-tooltip">
              <p>Jan 24</p>
              <div class="tooltip-row">
                <span class="label darkgreen_label">${this.point.category}</span>
                <span class="value tooltip-action-risk-severity-timeline cursor_pointer">0 alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="value view-link tooltip-action-risk-score-timeline cursor_pointer">View Alerts</span>
              </div>
            </div>
          `;
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        dataLabels: {
          enabled: true,
        },
        groupPadding: 0.1
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    series: [
      {

        data: [
          { y: 9000, color: '#008684' },
          { y: 7000, color: '#0095FF' },
          { y: 4000, color: '#6C5498' },
          { y: 6000, color: '#FA3E9C' },
          { y: 6500, color: '#C59AFF' },
        ],
      }
    ]
  }
  // Companies by Risk Category - Timeline E

  // Companies by Risk Category - Timeline S
  CompaniesRiskCategoryTimeline_Highcharts: any = {
    chart: {
      type: 'spline',
      height: 300,
      zooming: {
        type: 'y',
        enabled: true,
        mouseWheel: {
          enabled: true,
          type: 'scroll'
        }
      },
      events: {
        load: function () {
          const chart = this;

          chart.series.forEach(series => {
            series.points.forEach(point => {
              const label = point.dataLabel?.element;

              if (label) {
                label.style.cursor = 'pointer';

                label.addEventListener('mouseover', () => {
                  const xIndex = point.x;

                  chart.series.forEach(s => {
                    s.points.forEach(p => {
                      if (p.x === xIndex && p.dataLabel) {
                        p.dataLabel.element.style.opacity = 1;
                      } else if (p.dataLabel) {
                        p.dataLabel.element.style.opacity = 0.1;
                      }
                    });
                  });
                });

                label.addEventListener('mouseout', () => {
                  chart.series.forEach(s => {
                    s.points.forEach(p => {
                      if (p.dataLabel) {
                        p.dataLabel.element.style.opacity = 1;
                      }
                    });
                  });
                });
              }
            });
          });
        }
      }
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [],
      lineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickLength: 0,

      allowDecimals: true,
      accessibility: {
        rangeDescription: 'Range: 07 Sep to 18 Sep.',
      },
    },
    yAxis: {
      title: {
        text: 'No. of Alerts',
      },
      gridLineDashStyle: 'longdash',
    },
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: false
          }
        },
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: false
            }
          }
        },
        dataLabels: {
          enabled: true,
          borderRadius: 5,
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: '#AAA',
          padding: 4,
          inside: true,
          verticalAlign: 'middle',
          crop: false,
          overflow: 'justify',
          align: 'center',
          allowOverlap: false,
        },
        animation: {
          duration: 100,
        },

      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      shared: true,
      stickOnContact: true,
      formatter: function () {
        return `
            <div class="custom-long-tooltip">
                <p>Dec 2025</p>
                <div class="tooltip-row">
                  <span class="label darkgreen_label">Credit & Financial</span>
                  <span class="value tooltip-action-risk-category-timeline cursor_pointer">20 alerts</span>
                </div>
                <div class="tooltip-row">
                  <span class="label lightpink_label">Opportunity</span>
                  <span class="value tooltip-action-risk-category-timeline cursor_pointer">30 alerts</span>
                </div>
                <div class="tooltip-row">
                  <span class="label skyblue_label">Business & Operations</span>
                  <span class="value tooltip-action-risk-category-timeline cursor_pointer">30 alerts</span>
                </div>
                <div class="tooltip-row">
                  <span class="label pink_label">Legal & Compliance</span>
                  <span class="value tooltip-action-risk-category-timeline cursor_pointer">36 alerts</span>
                </div>
                <div class="tooltip-row">
                  <span class="label darkblue_label">Regulatory</span>
                  <span class="value tooltip-action-risk-category-timeline cursor_pointer">45 alerts</span>
                </div>
                <div class="tooltip-row">
                  <span class="label yellow_label">Reputation</span>
                  <span class="value tooltip-action-risk-category-timeline cursor_pointer">55 alerts</span>
                </div>
                <div class="tooltip-row">
                  <span class="label orange_label">Media & News</span>
                  <span class="value tooltip-action-risk-category-timeline cursor_pointer">63 alerts</span>
                </div>
                <div class="tooltip-row">
                  <span class="value tooltip-action-risk-category-timeline cursor_pointer">View Alerts</span>
                </div>
              </div>`;
      }
    },
    series: [
      {
        data: [7, 7, 7, 9, 9, 8, 8, 8, 8, 7, 8, 8],
        color: '#008684',
        dataLabels: {
          borderColor: '#008684',
        }
      },
      {
        data: [6.5, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5],
        color: '#C59AFF',
        dataLabels: {
          borderColor: '#C59AFF',
        }
      },
      {
        data: [6, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4],
        color: '#0095FF',
        dataLabels: {
          borderColor: '#0095FF',
        }
      },
      {
        data: [4, 4, 4, 4, 4, 4, 3, 2, 3, 3, 3, 3],
        color: '#FC3E9D',
        dataLabels: {
          borderColor: '#FC3E9D',
        }
      },
      {
        data: [2, 1, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2],
        color: '#6C5498',
        dataLabels: {
          borderColor: '#6C5498',
        }
      },
      {
        data: [4, 4, 4, 4, 4, 4, 3, 2, 3, 3, 3, 3],
        color: '#F8D66E',
        dataLabels: {
          borderColor: '#F8D66E',
        }
      },
      {
        data: [2, 1, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2],
        color: '#FF6961',
        dataLabels: {
          borderColor: '#FF6961',
        }
      },
    ]
  };
  // Companies by Risk Category - Timeline E



}
