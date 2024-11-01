// Usage: import { useBreakpoint } from '@/modules/usebreakpoint';
import { ref, onMounted, onUnmounted } from 'vue';

export function useBreakpoint() {
  const isMdAndUp = ref(false);
  const isSmAndUp = ref(false);

  const updateBreakpoint = () => {
    isMdAndUp.value = window.matchMedia('(min-width: 960px)').matches;
    isSmAndUp.value = window.matchMedia('(min-width: 600px)').matches;
    
  };

  onMounted(() => {
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoint);
  });

  return { isMdAndUp, isSmAndUp };
}