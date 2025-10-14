import { createContext, useContext, useState, ReactNode } from 'react';

export interface LabelInfoState {
  [scene: string]: {
    [labelId: string]: boolean;
  };
}

interface LabelInfoContextProps {
  state: LabelInfoState;
  markClicked: (scene: string, labelId: string) => void;
  reset: () => void;
}

const LabelInfoContext = createContext<LabelInfoContextProps | undefined>(undefined);

export const useLabelInfo = () => {
  const ctx = useContext(LabelInfoContext);
  if (!ctx) throw new Error('useLabelInfo must be used within LabelInfoProvider');
  return ctx;
};

export const LabelInfoProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<LabelInfoState>({});

  const markClicked = (scene: string, labelId: string) => {
    setState(prev => ({
      ...prev,
      [scene]: {
        ...prev[scene],
        [labelId]: true,
      },
    }));
  };

  const reset = () => setState({});

  return (
    <LabelInfoContext.Provider value={{ state, markClicked, reset }}>
      {children}
    </LabelInfoContext.Provider>
  );
};
