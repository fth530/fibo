import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
} from 'react-native-reanimated';

interface FloatingScoreProps {
    value: number;
    id: number;
    onDone: (id: number) => void;
}

export function FloatingScore({ value, id, onDone }: FloatingScoreProps) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(0.5);

    useEffect(() => {
        scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.back(2)) });
        translateY.value = withTiming(-60, { duration: 800, easing: Easing.out(Easing.quad) });
        opacity.value = withTiming(0, { duration: 800, easing: Easing.in(Easing.quad) }, () => {
            runOnJS(onDone)(id);
        });
    }, [id, onDone, opacity, scale, translateY]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.Text style={[styles.text, animStyle]}>
            +{value}
        </Animated.Text>
    );
}

const styles = StyleSheet.create({
    text: {
        position: 'absolute',
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: '#FF8C50',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(255,140,80,0.35)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
});
