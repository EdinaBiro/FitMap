import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react';
import Svg, {Circle,Line} from 'react-native-svg';
import { openPhotoPicker } from 'react-native-permissions';

const PoseVisualization = ({keypoints, cameraType}) => {
    console.log("Posevisualization called with: ", keypoints ? `${keypoints.points?.length || 0} points`: "no keypoints", cameraType);
if(!keypoints || !keypoints.points || !keypoints.connections){
    console.log("No keypoints to visualize");
    return null;
}

if(keypoints.points.length < 5 || keypoints.connections.length < 3){
    console.log("Insuffficient keypoints for vizualozation.");
    return null;
}

const COLORS = {
    torso: 'rgba(0, 255, 255, 0.8)',    // Cyan
    leftArm: 'rgba(0, 255, 0, 0.8)',    // Green
    rightArm: 'rgba(255, 255, 0, 0.8)', // Yellow
    leftLeg: 'rgba(255, 0, 255, 0.8)',  // Magenta
    rightLeg: 'rgba(255, 165, 0, 0.8)', //Orange
}

const getConnectionColor = (from,to) => {
    const mp_pose ={
        LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
        LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
        LEFT_WRIST: 15, RIGHT_WRIST: 16,
        LEFT_HIP: 23, RIGHT_HIP: 24,
        LEFT_KNEE: 25, RIGHT_KNEE: 26,
        LEFT_ANKLE: 27, RIGHT_ANKLE: 28
    };

    if((from === mp_pose.LEFT_SHOULDER && to === mp_pose.RIGHT_SHOULDER) ||
       (from === mp_pose.LEFT_SHOULDER && to === mp_pose.LEFT_HIP) ||
       (from === mp_pose.RIGHT_SHOULDER && to === mp_pose.RIGHT_HIP) ||
       (from === mp_pose.LEFT_HIP && to === mp_pose.RIGHT_HIP)){
        return COLORS.torso
       }
    if((from === mp_pose.LEFT_SHOULDER && to === mp_pose.LEFT_ELBOW) || 
      (from === mp_pose.LEFT_ELBOW && to === mp_pose.LEFT_WRIST)) {
        return COLORS.leftArm;
      }

      if((from === mp_pose.RIGHT_SHOULDER && to === mp_pose.RIGHT_ELBOW) || 
      (from === mp_pose.RIGHT_ELBOW && to === mp_pose.RIGHT_WRIST)) {
        return COLORS.rightArm;
      }

      if((from === mp_pose.LEFT_HIP && to === mp_pose.LEFT_KNEE) || 
      (from === mp_pose.LEFT_KNEE && to === mp_pose.LEFT_ANKLE)) {
        return COLORS.leftLeg;
      }

      if((from === mp_pose.RIGHT_HIP && to === mp_pose.RIGHT_KNEE) || 
      (from === mp_pose.RIGHT_KNEE && to === mp_pose.RIGHT_ANKLE)) {
        return COLORS.rightLeg;
      }

      return 'rgba(255,255,255, 0.8)';

};
    const {width, height} = Dimensions.get('window');
    const isFrontCamera = cameraType === 'front';

    const adjustXForCamera = (x) => {
        return isFrontCamera ? 1 - x : x;
    };
    console.log(
      `Rendering pose visualization with ${keypoints.points.length} points and ${keypoints.connections.length} connections`,
    );

    return(
        <View style={[styles.container]}>
            <Svg width={width} height={height} style={styles.svg}>
                {keypoints.connections.map((connection, index) => {
                    const fromPoint = keypoints.points.find(p => p.index === connection.from);
                    const toPoint = keypoints.points.find(p => p.index === connection.to);
                    
                    if(!fromPoint || !toPoint) return null;
                    const x1 = adjustXForCamera(fromPoint.x) * width;
                    const y1 = fromPoint.y * height;
                    const x2 = adjustXForCamera(toPoint.x) * width;
                    const y2 = toPoint.y * height;

                    if(isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || x1 < 0 || x1 > width || y1 < 0 || y1 > height || x2 < 0 || x2 > width || y2 < 0 || y2 > height){
                        return null;
                    }

                    return(
                        <Line
                        key={`line-${index}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={getConnectionColor(connection.from, connection.to)}
                        strokeWidth={3}
                        />
                    );
                })}

                {keypoints.points.map((point, index) => {
                    if(point.visibility < 0.5) return null;
                    const cx = adjustXForCamera(point.x) * width;
                    const cy = point.y * height;

                    if(isNaN(cx) || isNaN(cy) || cx < 0 || cx > width || cx < 0 || cy > height){
                        return null;
                    }

                    return(
                        <Circle
                        key={`point-${index}`}
                        cx={cx}
                        cy={cy}
                        r ={6}
                        fill="white"
                        stroke="rgba(0,0,0,0.5)"
                        strokeWidth={2}
                        />
                    );
                })}
            </Svg>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    svg:{
        position: 'absolute',
        top: 0,
        left: 0,
    }
});


export default PoseVisualization;