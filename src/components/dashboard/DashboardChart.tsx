import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DashboardChartProps {
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: any;
  loading?: boolean;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ 
  title, 
  type, 
  data,
  loading = false 
}) => {
  const getChartOption = () => {
    const baseOption = {
      title: {
        text: title,
        textStyle: {
          color: '#fff',
          fontSize: 18,
          fontWeight: 500
        },
        padding: [0, 0, 24, 0]
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: {
          color: '#fff'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      textStyle: {
        color: '#999'
      },
      legend: {
        textStyle: {
          color: '#999'
        }
      }
    };

    switch (type) {
      case 'bar':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: data.labels,
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#222'
              }
            }
          },
          series: [{
            data: data.values,
            type: 'bar',
            itemStyle: {
              color: function(params: any) {
                return params.value >= 0 ? '#22c55e' : '#ef4444';
              }
            }
          }]
        };

      case 'line':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: data.labels,
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#222'
              }
            }
          },
          series: [{
            data: data.values,
            type: 'line',
            smooth: true,
            lineStyle: {
              color: '#0073f5',
              width: 3
            },
            itemStyle: {
              color: '#0073f5'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(0, 115, 245, 0.2)'
                }, {
                  offset: 1,
                  color: 'rgba(0, 115, 245, 0)'
                }]
              }
            }
          }]
        };

      case 'pie':
        return {
          ...baseOption,
          series: [{
            type: 'pie',
            radius: '60%',
            data: data.map((item: any) => ({
              value: item.value,
              name: item.name,
              itemStyle: {
                color: item.value >= 0 ? '#22c55e' : '#ef4444'
              }
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };

      default:
        return baseOption;
    }
  };

  return (
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700 p-6 h-full hover:bg-dark-800/70 transition-colors">
      {loading ? (
        <div className="animate-pulse h-full">
          <div className="h-6 bg-dark-700 rounded w-1/4 mb-8"></div>
          <div className="h-[calc(100%-40px)] bg-dark-700 rounded"></div>
        </div>
      ) : (
        <ReactECharts 
          option={getChartOption()} 
          style={{ height: 'calc(100% - 24px)', width: '100%' }}
          theme="dark"
        />
      )}
    </div>
  );
};

export default DashboardChart;