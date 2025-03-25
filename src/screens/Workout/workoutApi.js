import axios from 'axios';
import moment, { duration } from 'moment';
import { baseURL } from '../../utils';

const BASE_URL = `${baseURL}/workout`;

const workoutApi = {
    saveWorkout: async (workoutData) => {
        try{
            const workoutDate = moment(workoutData.workout_date).format('YYYY-MM-DD');
            const startTime = workoutData.start_time || moment().format('HH:mm:ss');
            const endTime = workoutData.end_time || moment().format('HH:mm:ss');

            const response = await axios.post(`${BASE_URL}/add_workout`, {
                user_id : workoutData.user_id,
                distance: workoutData.distance,
                calories_burned: workoutData.calories_burned,
                pace: workoutData.pace,
                duration: workoutData.duration,
                workout_name: workoutData.workout_name,
                workout_date: workoutDate,
                start_time: startTime,
                end_time: endTime
            
            });
            return response.data;
        }catch(error){
            console.error('error saving workout', error);
            throw error;
        }
    },

    getUserWorkout: async (userId) => {
        try{
            const response = await axios.get(`${BASE_URL}/get_user_workout/${userId}`);
            return response.data.map(workout => ({
                ...workout,
                time: moment(workout.workout_date).format('HH:mm'),
                date: moment(workout.workout_date).format('YYYY-MM-DD'),
                calories: workout.calories_burned,
                start_time: workout.start_time,
                end_time: workout.end_time
            }));
        }catch(error){
            console.error('Error fetching user workouts', error);
            throw error;
        }
    },
    getWorkoutById: async (workoutId) => {
        try{
            const response = await axios.get(`${BASE_URL}/get_workout/${workoutId}`);
            const workout = response.data;
            return {
                ...workout,
                time: moment(workout.workout_date).format('HH:mm'),
                date: moment(workout.workout_date).format('YYYY-MM-DD'),
                calories: workout.calories_burned,
                start_time: workout.start_time,
                end_time: workout.end_time
            }
        }catch(error){
            console.error('Error fetching workout details', error);
            throw error;
        }
    },
    updateWorkout: async (workoutId, workoutData) => {
        try{

            const formattedData = {
                ...workoutData,
                wokrout_date: workoutData.wokrout_date
                    ? moment(workoutData.wokrout_date).format('YYYY-MM-DD')
                    : undefined,
                calories_burned: workoutData.calories || workoutData.calories_burned
            }
            const response = await axios.put(`${BASE_URL}/update_workout/${workoutId}`, formattedData);
            return response.data;
        }catch(error){
            console.error('Error updating workout: ', error);
            throw error;
        }
    },
    deleteWorkout: async (workoutId) => {
        try{
            const response = await axios.delete(`${BASE_URL}/delete_workout/${workoutId}`);
            return response.data;
        }catch(error){
            console.error('Error deleting workout: ', error);
            throw error;
        }
    }
}

export default workoutApi;