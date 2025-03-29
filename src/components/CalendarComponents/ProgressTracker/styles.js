import { StyleSheet } from "react-native";

export default StyleSheet.create({
    progresSection: {
        marginTop: 30,
        marginBottom: 20,
    },
    textProgress: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        color: '#333',
       },
       subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
       },
       comparisonContainer:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15,
        width: '100%',
    
       },
       imageColumn:{
        alignItems: 'center',
        marginHorizontal: 10,
       },
       imageLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
       },
       uploadButton: {
        height: 150,
        width: 150,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    image:{
        width: '100%',
        height: '100%',
    },
    uploadPlaceHolder:{
        alignItems: 'center',
        justifyContent: 'center',
       },
       uploadButtonText:{
        marginTop: 10,
        textAlign: 'center',
       },
       divider:{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
       },
       dividerLine: {
        height: 1,
        width: 30,
        backgroundColor: '#6200ee',
        marginVertical: 10,
       },
       dateBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
       },
       dateBadgeText: {
        color: 'white',
        fontSize:16
       },
       analyzeButton:{
        backgroundColor: '#6200ee',
        padding: 12,    
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
       },
       analyzeButtonText: {
        color: 'white',
        fontWeight: 'bold',
       },
});
