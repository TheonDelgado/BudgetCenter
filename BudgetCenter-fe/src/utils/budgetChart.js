let chartInstance = null

function toCurrencyCompact(value) {
  const numericValue = Number(value) || 0

  if (Math.abs(numericValue) >= 1000) {
    return `$${(numericValue / 1000).toFixed(1)}k`
  }

  return `$${Math.round(numericValue)}`
}

export function renderChart({ monthLabels = [], budgetAmounts = [], savingsAmounts = [] } = {}) {
  if (chartInstance?.destroy) {
    chartInstance.destroy()
    chartInstance = null
  }

  const chartElement = document.querySelector('#apex-multiple-column-charts')
  if (!chartElement) return null

  chartElement.innerHTML = ''

  const categories = Array.isArray(monthLabels) && monthLabels.length ? monthLabels : ['No Data']
  const budgetSeries = categories.map((_, index) => Number(budgetAmounts?.[index]) || 0)
  const savingsSeries = categories.map((_, index) => Number(savingsAmounts?.[index]) || 0)

  chartInstance = buildChart('#apex-multiple-column-charts', () => ({
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
        name: 'Budget Progress',
        data: budgetSeries
      },
      {
        name: 'Savings Progress',
        data: savingsSeries
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
      categories,
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
        formatter: value => toCurrencyCompact(value)
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
        formatter: value => toCurrencyCompact(value)
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
              formatter: value => toCurrencyCompact(value)
            }
          }
        }
      }
    ]
  }))

  return chartInstance
}

export function destroyChart() {
  if (chartInstance?.destroy) {
    chartInstance.destroy()
    chartInstance = null
  }

  const chartElement = document.querySelector('#apex-multiple-column-charts')
  if (chartElement) {
    chartElement.innerHTML = ''
  }
}