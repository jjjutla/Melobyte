import { Paper, Box, Button } from "@mui/material";

const AcceptStems = (props: any) => {
  const { getInputProps, getRootProps } = props;
  const { ref, ...rootProps } = getRootProps();

  return (
    <Button
      variant="contained"
      {...rootProps}
      style={{
        backgroundImage: 'linear-gradient(to right, #06DBAC, #BD00FF)',
        color: 'white'
      }}
    >
      <Paper sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
        <Box p={4}>
          <input {...getInputProps()} />
          <p style={{ color: 'white' }}>Upload stem files</p>
        </Box>
      </Paper>
    </Button>







  );
};

export default AcceptStems;
