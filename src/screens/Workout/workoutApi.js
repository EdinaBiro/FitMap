import axios from 'axios';
import { duration } from 'moment';

const BASE_URL = `http://192.168.1.7:8000/workout`;

const workoutApi = {
    saveWorkout: async (workoutData) => {
        try{
            const response = await axios.post(`${BASE_URL}/add_workout`, {
                user_id : workoutData.user_id,
                distance: workoutData.distance,
                calories_burned: workoutData.calories_burned,
                pace: workoutData.pace,
                duration: workoutData.duration,
                workout_name: workoutData.workout_name,
                workout_date: workoutData.workout_date
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
            return response.data;
        }catch(error){
            console.error('Error fetching user workouts', error);
            throw error;
        }
    },
    getWorkoutById: async (workoutId) => {
        try{
            const response = await axios.get(`${BASE_URL}/get_workout/${workoutId}`);
            return response.data;
        }catch(error){
            console.error('Error fetching workout details', error);
            throw error;
        }
    },
    updateWorkout: async (workoutId, workoutData) => {
        try{
            const response = await axios.put(`${BASE_URL}/update_workout/${workoutId}`, workoutData);
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