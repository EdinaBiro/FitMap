import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getWorkoutStats } from '../../services/StatisticsService';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 80;

const StatisticsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getWorkoutStats(timeRange);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [timeRange]),
  );

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f8f9fa',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6366f1',
    },
    strokeWidth: 3,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  const pieChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="bar-chart" size={48} color="#6366f1" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>No statistics data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Statistics</Text>
        <Text style={styles.headerSubtitle}>Track your fitness progress</Text>
      </View>

      <Card style={styles.timeRangeCard}>
        <View style={styles.timeRangeContainer}>
          <Text style={styles.timeRangeTitle}>Time Period</Text>
          <View style={styles.timeRangeButtons}>
            {['week', 'month', 'year'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRange]}
                onPress={() => setTimeRange(range)}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeRangeText, timeRange === range && styles.activeTimeRangeText]}>
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      <View style={styles.overviewContainer}>
        <Card style={[styles.overviewCard, styles.primaryCard]}>
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.overviewGradient}>
            <MaterialIcons name="fitness-center" size={24} color="#ffffff" />
            <Text style={styles.overviewValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.overviewLabel}>Total Workouts</Text>
          </LinearGradient>
        </Card>

        <Card style={[styles.overviewCard, styles.secondaryCard]}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.overviewGradient}>
            <MaterialIcons name="local-fire-department" size={24} color="#ffffff" />
            <Text style={styles.overviewValue}>{stats.totalCalories}</Text>
            <Text style={styles.overviewLabel}>Calories Burned</Text>
          </LinearGradient>
        </Card>
      </View>

      <View style={styles.overviewContainer}>
        <Card style={[styles.overviewCard, styles.accentCard]}>
          <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.overviewGradient}>
            <MaterialIcons name="timer" size={24} color="#ffffff" />
            <Text style={styles.overviewValue}>{stats.avgDuration}</Text>
            <Text style={styles.overviewLabel}>Avg Duration (min)</Text>
          </LinearGradient>
        </Card>

        <Card style={[styles.overviewCard, styles.successCard]}>
          <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.overviewGradient}>
            <MaterialIcons name="trending-up" size={24} color="#ffffff" />
            <Text style={styles.overviewValue}>{stats.completionRate}%</Text>
            <Text style={styles.overviewLabel}>Completion Rate</Text>
          </LinearGradient>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="show-chart" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Workout Frequency</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: stats.workoutFrequency.labels,
              datasets: [
                {
                  data: stats.workoutFrequency.data,
                },
              ],
            }}
            width={chartWidth}
            height={200}
            yAxisLabel=""
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showBarTops={false}
            withInnerLines={false}
          />
        </View>
        <View style={styles.chartStats}>
          <View style={styles.chartStatItem}>
            <Text style={styles.chartStatValue}>{stats.avgWorkoutsPerWeek}</Text>
            <Text style={styles.chartStatLabel}>Avg per Week</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="donut-small" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Workout Distribution</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <PieChart
            data={stats.workoutTypes}
            width={chartWidth}
            height={200}
            chartConfig={pieChartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
          />
        </View>
      </Card>

      <Card style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="whatshot" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Calories Burned Trend</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: stats.caloriesOverTime.labels,
              datasets: [
                {
                  data: stats.caloriesOverTime.data,
                  strokeWidth: 3,
                },
              ],
            }}
            width={chartWidth}
            height={200}
            yAxisLabel=""
            yAxisSuffix=" cal"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withInnerLines={false}
          />
        </View>
        <View style={styles.chartStats}>
          <View style={styles.chartStatItem}>
            <Text style={styles.chartStatValue}>{stats.avgCaloriesPerWorkout}</Text>
            <Text style={styles.chartStatLabel}>Avg per Workout</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="schedule" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Duration Trend</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: stats.durationOverTime.labels,
              datasets: [
                {
                  data: stats.durationOverTime.data,
                  strokeWidth: 3,
                },
              ],
            }}
            width={chartWidth}
            height={200}
            yAxisLabel=""
            yAxisSuffix=" min"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withInnerLines={false}
          />
        </View>
        <View style={styles.chartStats}>
          <View style={styles.chartStatItem}>
            <Text style={styles.chartStatValue}>{stats.longestWorkout} min</Text>
            <Text style={styles.chartStatLabel}>Longest</Text>
          </View>
          <View style={styles.chartStatItem}>
            <Text style={styles.chartStatValue}>{stats.shortestWorkout} min</Text>
            <Text style={styles.chartStatLabel}>Shortest</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="emoji-events" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Most Popular Exercises</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: stats.topExercises.labels,
              datasets: [
                {
                  data: stats.topExercises.data,
                },
              ],
            }}
            width={chartWidth}
            height={200}
            yAxisLabel=""
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showBarTops={false}
            withInnerLines={false}
          />
        </View>
      </Card>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 12,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  timeRangeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  timeRangeContainer: {
    padding: 20,
  },
  timeRangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTimeRange: {
    backgroundColor: '#6366f1',
    elevation: 2,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTimeRangeText: {
    color: '#ffffff',
  },
  overviewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  overviewCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },
  chartContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  chartStatItem: {
    alignItems: 'center',
  },
  chartStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 2,
  },
  chartStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default StatisticsScreen;
