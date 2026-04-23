export function renderChart() {
  buildChart('#apex-multiple-column-charts', () => ({
    chart: {
      type: 'bar',
      height: 400,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    series: [
      {
        name: 'Spent',
        data: [25000, 47000, 59000, 67000, 66000, 66000, 78000, 43000, 40000, 56000, 54000, 78000]
      },
      {
        name: 'Budget',
        data: [34000, 56000, 85000, 90000, 70000, 80000, 100000, 40000, 50000, 44000, 47000, 96000]
      }
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '12px',
        borderRadius: 0
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        useSeriesColors: true
      },
      markers: {
        shape: 'circle'
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ['var(--color-primary)', 'var(--color-success)'],
    xaxis: {
      categories: [
        'Cook',
        'Erin',
        'Jack',
        'Will',
        'Gayle',
        'Megan',
        'John',
        'Luke',
        'Ellis',
        'Mason',
        'Elvis',
        'Liam'
      ],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        show: false
      },
      labels: {
        style: {
          colors: 'var(--color-base-content)',
          fontSize: '12px',
          fontWeight: 400
        }
      }
    },
    yaxis: {
      labels: {
        align: 'left',
        minWidth: 0,
        maxWidth: 140,
        style: {
          colors: 'var(--color-base-content)',
          fontSize: '12px',
          fontWeight: 400
        },
        formatter: value => (value >= 1000 ? `${value / 1000}k` : value)
      }
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.9
        }
      }
    },
    tooltip: {
      y: {
        formatter: value => `$${value >= 1000 ? `${value / 1000}k` : value}`
      },
      custom: function (props) {
        const categories = props.w?.config?.xaxis?.categories || []
        const { dataPointIndex } = props
        const title = categories[dataPointIndex] || ''
        const newTitle = `${title}`

        const helperCompatibleProps = {
          ...props,
          ctx: {
            opts: props.w?.config || {}
          }
        }

        return buildTooltip(helperCompatibleProps, {
          title: newTitle,
          hasTextLabel: true,
          wrapperExtClasses: 'min-w-28',
          labelDivider: ':',
          labelExtClasses: 'ms-2'
        })
      }
    },
    responsive: [
      {
        breakpoint: 568,
        options: {
          chart: {
            height: 300
          },
          plotOptions: {
            bar: {
              columnWidth: '4px'
            }
          },
          labels: {
            style: {
              fontSize: '10px',
              colors: 'var(--color-base-content)'
            },
            offsetX: -2,
            formatter: title => title.slice(0, 3)
          },
          yaxis: {
            labels: {
              align: 'left',
              minWidth: 0,
              maxWidth: 140,
              style: {
                fontSize: '10px',
                colors: 'var(--color-base-content)'
              },
              formatter: value => (value >= 1000 ? `${value / 1000}k` : value)
            }
          }
        }
      }
    ]
  }))
}