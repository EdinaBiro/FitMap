import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container:{
        borderRadius: 20,
        padding: 16,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cityName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333',
    },
    mainContent: {
        alignItems: 'center',
        marginBottom: 20,
    },
    weatherIcon: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    temperature: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
    },
    description: {
        fontSize: 18,
        color: '#333',
        marginVertical: 5,
    }, 
    tempRange: {
        fontSize: 14,
        color: '#333'
    },
    forecastContainer:{
        marginTop: 10,
    },
    forecastTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    weekForecast: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayForecast: {
        alignItems: 'center',
    },
    dayText: {
        fontSize: 13,
        color: "#333",
    },
    smallWetherIcon: {
        width: 20,
        height: 20,
        marginVertical: 5,
    },
    dayTemp: {
        fontSize: 12,
        color: "#333",
    },
    container2:{
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        marginVertical: 5,
    },
    cardHeader:{
        flexDirection: 'row',
        alignItems: 'center',
    }, 
    cardTemp:{
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    cardDescription: {
        fontSize: 14,
        marginLeft: 10,
        color: '#555',
    }
});

