import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList } from 'react-native';
import React,{useState} from 'react';
import {AntDesign} from '@expo/vector-icons';
import {navigationRef} from '../../navigation/NavigationRef';

const trainersData = [
    { 
        id: '1',
        name: 'John Doe',
        profileImage: require('../../../assets/images/profile.jpg'),
        speciality: 'Weight Loss & Cardio',
        bio: 'Certified personal trainer with 10 years excperience',
        posts: [
            { id: 'p1', type: 'image', content: require('../../../assets/images/gym.jpg'), caption: 'Morning wokrout', likes: 10},
            { id: 'p2', type: 'text', content: 'Tip: Stay hydrated!', caption: 'Hydration tip', likes: 20 },
            { id: 'p3', type: 'poll', question: 'What is your favorite workout?', options: ['Cardio', 'Strength'], votes: [5, 10], likes: 15 },

        ]
    },

    { 
        id: '2',
        name: 'Jane Doe',
        profileImage: require('../../../assets/images/profilescreen.jpg'),
        speciality: 'Strength training',
        bio: 'Certified personal trainer',
        posts: [
            { id: 'p4', type: 'image', content: require('../../../assets/images/running.jpg'), caption: 'Running', likes: 12 },
            { id: 'p5', type: 'text', content: 'Focus on your breath.', caption: 'Mindfulness tip', likes: 18},

        ]
    }
];

const SocialMediaScreen = ({navigation}) => {
    const[trainers, setTrainers] = useState(trainersData);

    const handleLike = (trainerId, postId) => {
        setTrainers(prevTrainers => 
            prevTrainers.map(trainer => {
                if(trainer.id === trainerId){
                    return{
                        ...trainer,
                        posts: trainer.posts.map(post => {
                            if(post.id === postId){
                                return {...post, likes: post.likes + (post.liked ? -1 : 1), liked: !post.liked};
                            }
                            return post;
                        }),
                    };
                }
                return trainer;
            })

        );
    };

    const handleVote = (trainerId, postId, optionIndex) => {
        setTrainers(prevTrainers => 
            prevTrainers.map(trainer => {
                if(trainer.id === trainerId){
                    return{
                        ...trainer,
                        posts: trainer.posts.map(post => {
                            if(post.id === postId){
                                let newVotes = [...post.votes];
                                newVotes[optionIndex] +=1;
                                return {...post, votes: newVotes};
                            }
                            return post;
                        }),
                    };
                }
                return trainer;
            })
        )
    }

    const renderPost = ({item}) => {
        const trainerId = trainers.find(t => t.posts.some(p => p.id === item.id)).id;
     return(
        <View style={styles.postContainer}>
             {item.type === 'image' && (
            <>
                <Image source={item.content} style={styles.postImage} />
                <Text style={styles.caption}>{item.caption} ({item.likes} likes)</Text>
            </>
             )}
            {item.type === 'text' && <Text style={styles.textPost}>{item.content}</Text>}
            {item.type === 'poll' && (
                <View>
                <Text style={styles.pollQuestion}>{item.question}</Text>
                {item.options.map((option, index) => (
                    <TouchableOpacity key={index} style={styles.pollQuestion} onPress={() => handleVote(trainerId, item.id, index)}>
                        <Text style={styles.pollQuestionText}>{option}</Text>
                        <View style={styles.pollBar}>
                            <View style={[styles.pollBarFill, {width: `${(item.votes[index] / item.votes.reduce((a,b) => a + b, 0)) * 100}%`}]} />
                            <Text style={styles.pollVotes}>{item.votes[index]}</Text></View>
                        <Text style={styles.pollVotes}>{item.votes[index]} votes</Text>
                    </TouchableOpacity>
                ))}
                    </View>
            )}
                <TouchableOpacity style={styles.likesContainer} onPress={() => handleLike(trainerId, item.id)}>
                    <AntDesign name="heart" size={16} color={item.liked ? "red":"gray"}/>
                    <Text style={styles.likes}>{item.likes} likes</Text>
                    
                </TouchableOpacity>
                </View>
            );
        };

    const renderTrainer = ({item}) =>{
        const latestPost = item.posts[item.posts.length -1];
        return(
            <TouchableOpacity style={styles.trainerContainer} onPress={() => navigation.navigate('WorkoutStackNavigator',{screen: 'TrainerProfileScreen',params: {trainerId: item.id}})}>
                <Image source={item.profileImage} style={styles.profileImage}/>
                <View style={styles.trainerInfo}>
                    <Text style={styles.trainerName}>{item.name}</Text>
                    <Text style={styles.speciality}>{item.speciality}</Text>
                    {latestPost && renderPost({item: latestPost})}
                </View>
            </TouchableOpacity>
        );
    };
  return (
    <View style={styles.container}> 
      <FlatList 
        data={trainers}
        renderItem={renderTrainer}
        keyExtractor={trainer => trainer.id}
        style={styles.trainerList} />
    </View>
  );
};

export default SocialMediaScreen

const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f4f8',
    },
    trainerContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    trainerInfo: {
        justifyContent: 'center',
        flex: 1,
    },
    trainerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#333",
    },
    speciality: {
        fontSize: 14,
        color: "#777",
    },
    postContainer:{
        marginTop: 10,
        padding: 15,
        backgroundColor: '#CBC3E3',
        borderRadius: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#009688',
    },
    postImage:{
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    caption: {
        fontSize: 14,
        marginTop: 5,
    },
    textPost: {
        fontSize: 16,
        color: '#333',
    },
    pollQuestion: {
        fontSize: 16,
        fontWeight: 'bold',
        olor: '#333',
        marginBottom: 5,
    },
    pollOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    pollQuestionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    pollVotes: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    likes: {
        marginLeft: 5,
        fontSize: 14,
        color: '#333',
    },
    pollBar: {
        flex: 1,
        height: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        marginLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    pollBarFill: {
        height: '100%',
        backgroundColor: '#6200ee',
        borderRadius: 10,
    },
})
