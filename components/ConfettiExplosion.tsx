import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';

const PARTICLE_COUNT = 40;
const CONFETTI_COLORS = [
    '#FF8C50', '#F06858', '#D85090', '#A840C8',
    '#7868D8', '#4888E8', '#28B0C8', '#28A878',
    '#FFB058', '#FFCC88',
];

interface ConfettiParticle {
    id: number;
    color: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    rotation: number;
    delay: number;
    size: number;
    shape: 'rect' | 'circle';
}

function Particle({ particle }: { particle: ConfettiParticle }) {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        progress.value = withDelay(
            particle.delay,
            withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) })
        );
        opacity.value = withDelay(
            particle.delay + 1000,
            withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) })
        );
    }, [opacity, particle.delay, progress]);

    const animStyle = useAnimatedStyle(() => {
        const t = progress.value;
        const x = particle.startX + (particle.endX - particle.startX) * t;
        const y = particle.startY + (particle.endY - particle.startY) * t + t * t * 300;
        return {
            transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${particle.rotation * t * 720}deg` },
                { scale: 1 - t * 0.3 },
            ],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    width: particle.size,
                    height: particle.shape === 'rect' ? particle.size * 0.5 : particle.size,
                    borderRadius: particle.shape === 'circle' ? particle.size / 2 : 3,
                    backgroundColor: particle.color,
                },
                animStyle,
            ]}
        />
    );
}

export function ConfettiExplosion() {
    const { width } = useWindowDimensions();
    const centerX = width / 2;

    const particles = useMemo<ConfettiParticle[]>(() => {
        return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
            id: i,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            startX: centerX - 4,
            startY: -20,
            endX: centerX + (Math.random() - 0.5) * width * 0.9,
            endY: -80 + Math.random() * 200,
            rotation: Math.random() > 0.5 ? 1 : -1,
            delay: Math.random() * 400,
            size: 6 + Math.random() * 8,
            shape: Math.random() > 0.5 ? 'rect' : 'circle' as 'rect' | 'circle',
        }));
    }, [centerX, width]);

    return (
        <>
            {particles.map((p) => (
                <Particle key={p.id} particle={p} />
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
});
