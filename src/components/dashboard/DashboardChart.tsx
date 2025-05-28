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
          fontSize: 16,
          fontWeight: 'normal'
        }
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

    // Configurações específicas por tipo de gráfico
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
            color: '#0073f5'
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
            color: '#0073f5'
          }]
        };

      case 'pie':
        return {
          ...baseOption,
          series: [{
            type: 'pie',
            radius: '50%',
            data: data.map((item: any) => ({
              value: item.value,
              name: item.name
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
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700 p-6">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-dark-700 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-dark-700 rounded"></div>
        </div>
      ) : (
        <ReactECharts 
          option={getChartOption()} 
          style={{ height: '400px', width: '100%' }}
          theme="dark"
        />
      )}
    </div>
  );
};

export default DashboardChart;