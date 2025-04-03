import { StyleSheet } from "react-native";

export default StyleSheet.create({
    agendaContainer: {
        flex:1,
    },
 
    emptyAgenda: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    emptyAgendaText:{
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    planWorkoutButton: {
        backgroundColor: '#6200ee',
        padding: 12,
        borderRadius: 15,
        alignItems: 'center',
        marginVertical: 10,
    },
    planWorkoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    floatingAddButton:{
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#6200ee',
        borderRadius: 28,
        elevation: 8,
        zIndex: 999,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    },
    floatingAddButtonText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold'
    }
})