export type GlobalDialogType = {
  isOpen: boolean;
  title: string;
  content: JSX.Element | null;
  contentText?: JSX.Element | string | null;
  actions: JSX.Element | null;
};
