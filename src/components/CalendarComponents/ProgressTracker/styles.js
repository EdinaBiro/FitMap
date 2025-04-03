import { StyleSheet } from "react-native";

export default StyleSheet.create({
    progresSection: {
        marginTop: 10,
        marginBottom: 20,
        paddingBottom: 20,
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
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
    
       },
       imageColumn:{
        alignItems: 'center',
        width: '42%'
       },
       imageLabel: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
        color: '#555',
       },
       uploadButton: {
        height: 180,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f8f8f8',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    image:{
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    imageDateGradient: {
        position: 'absolute',
        bottom: 0,
        left:0,
        right: 0,
        height: 50,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    uploadPlaceHolder:{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#f2f0f7',
        borderRadius: 16,
       },
       addButtonGradient:{
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
       },
       uploadButtonText:{
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
        color: '#6200ee',
       },
       divider:{
        // flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingHorizontal: 10,
        witdh: '16%'
       },
       dividerLine: {
        height: 1,
        width: 30,
        backgroundColor: '#6200ee',
        marginVertical: 10,
       },
       dividerIcon:{
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
       },
       dateBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
       },
       dateBadgeText: {
        color: 'white',
        fontSize:16,
        fontWeight: '500'
       },
       analyzeButtonContainer:{
        paddingHorizontal: 20,
        marginBottom: 25
       },
       analyzeButton:{
        backgroundColor: '#6200ee',
        padding: 12,    
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        paddingVertical: 16,
        shadowColor: '#6200ee',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
       },
       analyzeButtonDisabled: {
        backgroundColor: '#b39ddb',
        shadowOpacity: 0.1,
       },
       analyzeButtonContent: {
        flexDirection: 'row',
        aligItems: 'center',
        justifyContent: 'center',
       },
       analyzeButtontext: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
       },
       analysisCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
       },
       analysisHeader:{
        flexDirection: 'row',
        aligItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
       },
       progressHeader:{
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
       },
       textProgress:{
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
       },
       imageContainer:{
        witdh: '100%',
        height: '100%',
        position: 'relative',
       }
});
