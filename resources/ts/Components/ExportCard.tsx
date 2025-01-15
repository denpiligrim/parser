import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

type LinearProgressWithLabelProps = {
  value: number;
};

const LinearProgressWithLabel: React.FC<LinearProgressWithLabelProps> = ({ value }) => {
  return (
    <Box display="flex" alignItems="center" mt={2}>
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.floor(value)}%`}</Typography>
      </Box>
    </Box>
  );
};

const ExportCard: React.FC<{ progress: number; currentProcess: string }> = ({ progress, currentProcess }) => {
  return (
    <Card sx={{ maxWidth: 500, margin: 'auto', mt: 5 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {progress === 100 ? 'Парсинг завершен' : 'Выгружаем товары...'}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {currentProcess}
        </Typography>
        <LinearProgressWithLabel value={progress} />
      </CardContent>
    </Card>
  );
};

export default ExportCard;