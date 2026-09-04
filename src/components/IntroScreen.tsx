import { Button, Card, Text, Title1, makeStyles, tokens } from '@fluentui/react-components';

type IntroScreenProps = {
  onGetStarted: () => void;
};

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalXXL,
  },
  eyebrow: {
    display: 'block',
    marginBottom: tokens.spacingVerticalS,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightBold,
  },
  title: {
    display: 'block',
    marginBottom: tokens.spacingVerticalM,
  },
  description: {
    display: 'block',
    maxWidth: '54ch',
  },
  action: {
    marginTop: tokens.spacingVerticalXL,
    minHeight: '44px',
  },
});

export function IntroScreen({ onGetStarted }: IntroScreenProps) {
  const styles = useStyles();

  return (
    <main className="wizard-shell">
      <Card className={styles.card}>
        <Text className={styles.eyebrow}>Microsoft Tool Advisor</Text>
        <Title1 as="h1" className={styles.title}>
          Find the right Microsoft tool for your business need
        </Title1>
        <Text className={styles.description}>
          Answer a few guided questions to compare Microsoft tools and get a recommendation with
          clear reasoning.
        </Text>
        <Button
          appearance="primary"
          className={styles.action}
          type="button"
          onClick={onGetStarted}
        >
          Get Started
        </Button>
      </Card>
    </main>
  );
}