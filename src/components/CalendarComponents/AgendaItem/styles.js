import { StyleSheet } from "react-native";

export default StyleSheet.create({
    swipeableContainer:{
        backgroundColor: 'white',
        borderRadius: 10,
        marginVertical: 5,
        overflow: 'hidden',
       },
       agendaItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
    },
    agendaItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    agendaItemType: {
        fontSize: 13,
        color: '#666',
    },
    agendaItemTitle: {
        fontSize: 18,
        fontWeight: '500'
     },
     workoutStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    statText:{
        fontSize: 13,
        color: '#444',
    },
    plannedTag: {
        alignSelf: 'flex-start',
    },
    swipeActionsContainer: {
        flexDirection: 'row',
        alignItems:'center',
       },
       swipeAction:{
        width: 70,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
       },
       editAction: {
        backgroundColor: '#4CAF50',
       },
       deleteAction: {
        backgroundColor: '#F44336'
       },
})
