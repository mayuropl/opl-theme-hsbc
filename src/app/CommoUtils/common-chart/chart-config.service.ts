import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartConfigService {
  
  // Helper method to calculate rounded maximum for y-axis (rounds UP to ensure data fits)
  calculateRoundedMax(maxValue: number): number {
    if (maxValue <= 0) return 1000;
    if (maxValue <= 1) return 1;
    if (maxValue <= 2) return 2;
    if (maxValue <= 5) return 5;
    if (maxValue <= 10) return 10;
    
    // Get the order of magnitude (power of 10)
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    
    // Calculate the normalized value (e.g., 47860.8 -> 4.786, 67000 -> 6.7, 51066 -> 5.1066)
    const normalized = maxValue / magnitude;
    
    // Round UP to next nice number to ensure y-axis max is always >= data max
    // Nice numbers: 1, 2, 3, 4, 5, 6, 7, 8, 10
    let roundedNormalized;
    if (normalized <= 1) {
      roundedNormalized = 1;
    } else if (normalized <= 2) {
      roundedNormalized = 2;
    } else if (normalized <= 3) {
      roundedNormalized = 3;
    } else if (normalized <= 4) {
      roundedNormalized = 4;
    } else if (normalized <= 5) {
      roundedNormalized = 5;
    } else if (normalized <= 6) {
      roundedNormalized = 6;
    } else if (normalized <= 7) {
      roundedNormalized = 7;
    } else if (normalized <= 8) {
      roundedNormalized = 8;
    } else if (normalized < 10) {
      roundedNormalized = 10;
    } else {
      // For values >= 10, move to next magnitude
      return 10 * magnitude * 10;
    }
    
    return roundedNormalized * magnitude;
  }
  
  // Helper method to calculate tick interval based on max value
  calculateTickInterval(maxValue: number): number {
    // Calculate nice tick interval (typically 1/5th or 1/6th of max, rounded to nice number)
    if (maxValue <= 10) {
      return 2;
    } else if (maxValue <= 50) {
      return 10;
    } else if (maxValue <= 100) {
      return 20;
    } else if (maxValue <= 500) {
      return 100;
    } else if (maxValue <= 1000) {
      return 200;
    } else if (maxValue <= 5000) {
      return 1000;
    } else if (maxValue <= 10000) {
      return 2000;
    } else if (maxValue <= 30000) {
      return 10000;
    } else if (maxValue <= 60000) {
      return 10000; // For 60000, gives 0, 10000, 20000, 30000, 40000, 50000, 60000
    } else if (maxValue <= 80000) {
      return 20000;
    } else if (maxValue <= 100000) {
      return 20000;
    } else if (maxValue <= 500000) {
      return 100000;
    } else if (maxValue <= 1000000) {
      return 200000;
    } else {
      // For larger values, calculate as 1/5th of max, rounded to nice number
      const interval = maxValue / 5;
      const magnitude = Math.pow(10, Math.floor(Math.log10(interval)));
      const normalized = interval / magnitude;
      let roundedNormalized;
      if (normalized <= 1) {
        roundedNormalized = 1;
      } else if (normalized <= 2) {
        roundedNormalized = 2;
      } else if (normalized <= 5) {
        roundedNormalized = 5;
      } else {
        roundedNormalized = 10;
      }
      return roundedNormalized * magnitude;
    }
  }
  getTrendsLendingChart(): any {
    return {
      chart: {
        type: 'spline',
        height: 360,
        backgroundColor: '#fff',
        spacingBottom: 20,
        zoomType: null, // Disable drag zoom - using button controls instead
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        },
        events: {
          load: function() {
            const chart = this;
            // After line animation completes (1500ms), trigger marker blink animation
            setTimeout(() => {
              chart.series.forEach(series => {
                if (series.points) {
                  series.points.forEach((point, index) => {
                    if (point.graphic) {
                      const marker = point.graphic;
                      // Stagger the blink animation for each point
                      setTimeout(() => {
                        // Scale up
                        marker.animate({
                          r: 8,
                          opacity: 1
                        }, {
                          duration: 200,
                          easing: 'easeOutQuad'
                        });
                        // Scale back down
                        setTimeout(() => {
                          marker.animate({
                            r: 5,
                            opacity: 1
                          }, {
                            duration: 200,
                            easing: 'easeInQuad'
                          });
                        }, 200);
                      }, index * 80); // Stagger each point by 80ms
                    }
                  });
                }
              });
            }, 1600); // Wait for line animation to complete
          }
        }
      },
      title: { text: null },
      xAxis: {
        lineColor: '#09111D1F',
        lineWidth: 2,
        gridLineColor: '#CCCCCC',
        gridLineDashStyle: 'Dash',
        categories: ['Oct 24', 'Dec 24', 'Mar 25', 'Jul 25', 'Sep 25', 'Dec 25'],
        tickLength: 5,
        tickColor: '#888888',
        tickWidth: 1,
        tickmarkPlacement: 'on',
        labels: { 
          style: { fontSize: '12px', color: '#666' },
          align: 'center',
          x: 0,
          y: 20
        }
      },
      yAxis: {
        lineColor: '#09111D1F',
        lineWidth: 2,
        gridLineColor: '#CCCCCC',
        gridLineDashStyle: 'Dash',
        title: { text: null },
        labels: { 
          style: { fontSize: '12px', color: '#666' },
          align: 'center',
          formatter: function() {
            // Show full number without abbreviation (no k, M, etc.)
            return this.value.toLocaleString();
          }
        },
        min: 0,
        // max and tickInterval should be set dynamically in component based on data
        // Use calculateRoundedMax() and calculateTickInterval() helper methods
        tickLength: 5,
        tickColor: '#888888',
        tickWidth: 1
      },
      legend: { 
        enabled: true,
        useHTML: true,
        symbolHeight: 3,
        symbolWidth: 16,
        symbolRadius: 0,
        itemStyle: {
          fontSize: '12px',
          fontWeight: 'bold'
        },
        symbolPadding: 8,
        itemMarginBottom: 5,
        labelFormatter: function() {
          // Get the series color
          const color = this.color || '#000';
          // Return HTML with colored text matching the series color, bold
          return `<span style="color: ${color}; font-weight: bold;">${this.name}</span>`;
        }
      },
      
      // tooltip: {
      //   enabled: true,
      //   useHTML: true,
      //   shared: true,
      //   stickOnContact: true,
      //   formatter: function () {
      //     return `
      //       <div class="custom-long-tooltip">
      //          <div class="tooltip-row">
      //           <span class="label darkgreen_label">Bank Sanction</span>
      //           <span class="value">${this.y}</span>
      //         </div>
      //         <div class="tooltip-row">
      //           <span class="label darkgreen_label">Competition Sanction</span>
      //           <span class="value">${this.y}</span>
      //         </div>
      //         <div class="tooltip-row">
      //           <span class="label darkgreen_label">Bank Wallet %</span>
      //           <span class="value">${this.y}</span>
      //         </div>
      //       </div>
      //     `;
      //   }
      // },
      plotOptions: {
        series: {
          animation: {
            duration: 1500,
            easing: 'easeOutQuart'
          }
        },
        spline: {
          marker: {
            enabled: true,
            radius: 5,
            fillColor: '#fff',
            lineWidth: 2,
            lineColor: null,
            states: {
              hover: {
                enabled: true
              }
            }
          },
          showInLegend: true,
          lineWidth: 3,
          animation: {
            duration: 1500,
            easing: 'easeOutQuart'
          },
          dataLabels: {
            enabled: true,
            formatter: function () {
              // Round to whole number, remove decimals
              return Math.round(this.y);
            },
            style: {
              fontSize: '12px',
              fontWeight: '500',
              color: '#000'
            },
            verticalAlign: 'bottom',
          }
        }
      },
      // series: [
      //   {
      //     name: 'Bank Sanction (₹M)',
      //     data: [5228, 5467, 5865, 6345, 7124, 7626],
      //     color: '#E02020',
      //     marker: {
      //       fillColor: '#f9d6d6',
      //       lineColor: '#FFFFFF',
      //       lineWidth: 2,
      //       radius: 5
      //     }
      //   },
      //   {
      //     name: 'Competition Sanction (₹M)',
      //     data: [3958, 3456, 4156, 4421, 3714, 5142],
      //     color: '#ABB8C7',
      //     marker: {
      //       fillColor: '#D9E0E8',
      //       lineColor: '#FFFFFF',
      //       lineWidth: 2,
      //       radius: 5
      //     }
      //   }
      // ]
    };
  }

  getSegmentLevelOpportunityChart(): any {
    return {
      chart: { 
        type: 'column', 
        height: 350,
        animation: {
          duration: 2000,
          easing: 'easeOutQuart'
        }
      },
      title: { enabled: false, text: null },
      xAxis: {
        lineColor: '#09111D1F',
        lineWidth: 2,
        gridLineColor: '#CCCCCC',
        gridLineDashStyle: 'Dash',
        categories: ['GNB', 'IMM', 'GCC', 'BB', 'IC'],
        tickLength: 0
      },
      yAxis: {
        min: 0,
        lineColor: '#09111D1F',
        lineWidth: 2,
        gridLineColor: '#CCCCCC',
        gridLineDashStyle: 'Dash',
        title: { text: null },
        tickLength: 0,
        labels: {
          formatter: function() {
             return this.value.toLocaleString();
          }
        }
      },
      tooltip: {
        enabled: false,
        shared: true,
        valueSuffix: ' MT'
      },
      legend: {
        enabled: true,
        symbolHeight: 10,
        symbolWidth: 10,
        symbolRadius: 0
      },
      plotOptions: {
        series: {
          animation: {
            duration: 2000,
            easing: 'easeOutQuart'
          }
        },
        column: {
          pointPadding: 0,
          groupPadding: 0.08,
          pointWidth: 50,
          borderWidth: 0,
          animation: {
            duration: 2000,
            easing: 'easeOutQuart'
          },
          dataLabels: {
            enabled: false,
            color: '#333333',
            inside: true,
            style: {
              textOutline: 'none'
            }
          }
        }
      },
      // series: [
      //   {
      //     name: 'Bank Utilization Amt (₹M)',
      //     data: [777, 532, 1205, 673, 673],
      //     color: {
      //       linearGradient: [0, 0, 0, 300],
      //       stops: [
      //         [0, '#E01F26E6'],
      //         [1, '#E53E3EB3']
      //       ]
      //     }
      //   },
      //   {
      //     name: 'Competition Utilization Amt (₹M)',
      //     data: [2567, 3567, 2456, 2345, 2345],
      //     color: {
      //       linearGradient: [0, 0, 0, 300],
      //       stops: [
      //         [0, '#A0AEC0E6'],
      //         [1, '#CBD5E0B3']
      //       ]
      //     }
      //   }
      // ]
    };
  }

  getProductLevelOpportunityChar() : any {
    return {
      chart: {
        type: 'bar',
        height: 650,
        spacingRight: 200,
        spacingBottom: 10, 
        panKey: 'shift',
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      },
      title: {
        text: null
      },
      xAxis: {
        categories: [
          'Term Loan', 'Secured', 'Others', 'Non Fund Based', 'Fund Based',
          'Factoring', 'EXIM Loans', 'Corporate Card', 'Commercial Paper', 'Bank Line'
        ],
        title: null,
        labels: {
          style: {
            fontWeight: 700,
            fontSize: '15px',
            color:'#333333'
          },
          y: -18,
          align: 'left',
          x:0   
        },
        gridLineWidth: 0,
        lineWidth: 0,    
        lineColor: '#000',
        opposite: false,
        tickLength: 0,   
      },
    
      yAxis: {
        visible: false,
        gridLineWidth: 0,
        lineWidth: 1,    
        lineColor: '#888888',
        tickLength: 5,
        tickColor: '#888888',
        tickWidth: 1,
        title: {
          text: null
        },
        labels: {
          formatter: function() {
             return this.value.toLocaleString();
          }
        }
      },
      legend: {
        enabled: true,
        symbolHeight: 10,
        symbolWidth: 10,
        symbolRadius: 0,
        itemStyle: {
          cursor: 'default',
          pointerEvents: 'none'
        }
      },
      tooltip: {
        shared: true,
        formatter: function () {
          let s = `<div class="op_chart_tooltip"><span class="title_bar_chart_tooltip">${this.x}</span>`;
      
          // Get Competition + Bank values - use indexOf() to match regardless of unit suffix
          const compPoint = this.points.find(p => p.series.name.indexOf('Competition Utilization') !== -1);
          const hsbcPoint = this.points.find(p => p.series.name.indexOf('Bank Utilization') !== -1 && p.series.name.indexOf('%') === -1);
          const comp = compPoint ? compPoint.y : 0;
          const hsbc = hsbcPoint ? hsbcPoint.y : 0;
      
          const total = comp + hsbc;
          const percent = total ? ((hsbc / total) * 100).toFixed(2) : 0;
      
           this.points.forEach(point => {
            if (point.series.color !== 'transparent') {
              s += `<span class="tooltip-row"><span style="color:${point.color}">\u25CF</span> ${point.series.name} : <span class="value">${point.y.toLocaleString()}</span></span>`;
            }
          });
      
           s += `<span class="tooltip-row"><b>Bank Utilization Wallet % : ${percent}</b></span></div>`;
      
          return s;
        },
        useHTML: true
      },
      plotOptions: {
        bar: {
            stacking: 'normal',
            maxPointWidth: 25,
            grouping: false,
            groupPadding: 0.1,
            pointPadding: 0.1,
            borderRadius: 6,
            animation: {
              duration: 1000,
              easing: 'easeOutQuart'
            },
          dataLabels: {
            enabled: true,
            inside: true,
            overflow: 'allow',
            crop: false,
            formatter: function () {
              return '$' + this.y.toLocaleString();   // FORCE the actual value
            },
            style: {
              color: 'transparent',
              fontWeight: 'bold',
              textOutline: 'none',
              // opacity:0,
            }
          }
        },
        series: {
          grouping: false,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          events: {
            legendItemClick: function() {
              return false; // Prevent show/hide on legend click
            }
          }
         }
      },
      // series: [
      //   {
      //     name: 'Competition Utilization (₹M)',
      //     color: '#AAB6C6',
      //     borderRadiusTopLeft: 6,
      //     borderRadiusBottomLeft: 6,
      //     borderRadiusTopRight: 6,
      //     borderRadiusBottomRight: 6,
      //     dataLabels: {
      //       enabled: true,
      //       inside: true,
      //       align: 'center',
      //       color: '#fff',
      //       style: {
      //         fontWeight: 'bold',
      //         textOutline: 'none'
      //       }
      //     },
      //     data: [2443.07, 2048.68, 1483.93, 3188.11, 3324.71, 3144.88, 1971.36, 3389.71, 1422.59, 2239.52]
      //   },
      //   {
      //     name: 'Bank Utilization (₹M)',
      //     color: '#32327F',
      //     borderRadiusTopLeft: 6,
      //     borderRadiusBottomLeft: 6,
      //     borderRadiusTopRight: 6,
      //     borderRadiusBottomRight: 6,
      //     dataLabels: {
      //       enabled: true,
      //       inside: true,
      //       align: 'center',
      //       color: '#fff',
      //       style: {
      //         fontWeight: 'bold',
      //         textOutline: 'none'
      //       }
      //     },
      //     data: [2303.66, 1786.55, 3180.46, 3486.77, 4784.35, 2302.17, 2116.08, 3206.88, 3713.89, 2851.52]
      //   },
      //   {
      //     // Invisible series to show percentages outside stacked red bars
      //     name: 'Bank Utilization %',
      //     color: 'transparent',
      //     enableMouseTracking: false,
      //     showInLegend: false,
      //     stacking: undefined,
      //     dataLabels: {
      //       enabled: true,
      //       inside: false,
      //       align: 'left',
      //       color: '#333333',
      //       y: -25,
      //       formatter: function() {
      //         const percentages = ['71.43%', '61.21%', '52.95%', '68.50%', '73.84%', '45.98%', '84.21%', '69.62%', '78.20%', '51.84%'];
      //         return percentages[this.point.index] || null;
      //       },
      //       style: {
      //         fontWeight: 'bold',
      //         textOutline: 'none',
      //         fontSize: '12px'
      //       }
      //     },
      //     data: [4746.73, 3835.23, 4664.39, 6674.88, 8109.06, 5447.05, 4087.44, 6596.59, 5136.48, 5091.04] // sum of both series values to position percentages correctly
      //   }
      // ],
      credits: {
        enabled: false
      }
    };
  };

  getCustomerLevelOpportunity() : any {
    return {
      chart: {
        type: 'pie',
        height: 300,
        custom: {},
        animation: {
          duration: 2000,
          easing: 'easeOutQuart'
        },
        events: {
          render() {
            const chart = this,
              series = chart.series[0];
            let customLabel = chart.options.chart.custom.label;
  
            if (!customLabel) {
              customLabel = chart.options.chart.custom.label =
                chart.renderer.label(
                  '<div class="pie_chart_center_text">' +
                  '<span class="title_text">Competition</span><br/>' +
                  '&nbsp;'+
                  '<span class="title_desc">300 Customers</span><br/>' +
                  '&nbsp;'+
                  '<span class="number_text">₹ 732 M</span>' +
                  '</div>',
                )
                  .css({
                    color: 'var(--highcharts-neutral-color-100, #000)',
                    textAnchor: 'middle'
                  })
                  .add();
            }
  
            const x = series.center[0] + chart.plotLeft,
              y = series.center[1] + chart.plotTop - (customLabel.attr('height') / 2);
  
            customLabel.attr({
              x,
              y
            });
  
            customLabel.css({
              fontSize: `${series.center[2] / 12}px`
            });
          }
        }
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      title: {
        text: ''
      },
      subtitle: {
        text: ''
      },
      tooltip: {
        enabled: false,
        pointFormat: '{series.name}: <b>{point.percentage:.0f}%</b>'
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderRadius: 0,
          animation: {
            duration: 2000,
            easing: 'easeOutQuart'
          },
          dataLabels: [{
            enabled: false,
            distance: 20,
            format: '{point.name}'
          }, {
            enabled: false,
            distance: -15,
            format: '{point.percentage:.0f}%',
            style: {
              fontSize: '0.9em'
            }
          }],
          showInLegend: true
        },
        pie: {
          animation: {
            duration: 2000,
            easing: 'easeOutQuart'
          }
        }
      },
      series: [
        {
          name: 'Competition',
          colorByPoint: true,
          innerSize: '70%',
          data: [
            {
              name: '',
              y: 23.9,
              color: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                stops: [
                  [0, '#94A3B8'],
                  [1, '#94A3B8B3'],
                ],
              },
            },
            {
              name: '',
              y: 26.4,
              color: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                stops: [
                  [0, '#32327F'],
                  [1, '#F87171B3'],
                ],
              },
            },
            {
              name: '',
              y: 20,
              color: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                stops: [
                  [0, '#DAE1E6E6'],
                  [1, '#7E8F9B'],
                ],
              },
            },
          ],
        },
      ],
    };
  }
}
