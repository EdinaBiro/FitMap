import { StyleSheet } from "react-native";

export default StyleSheet.create({
    analysisResultContainer: {
        backgroundColor: '#f8f4ff',
        padding: 20,
        borderRadius: 12,
        marginTop: 15,
        marginBottom: 30,
        borderColor: "#6200ee",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
       },
       analysisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0d0ff',
        paddingBottom: 8,
       },
       analysisHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6200ee',
        marginLeft: 8,
       },
       analysisResultText: {
        color: '#333',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
       },
       analysisFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
       },
     
});