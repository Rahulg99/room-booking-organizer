import { Box, Modal, createTheme, useMediaQuery } from "@mui/material"

export function ResponsiveBox(props) {
    const theme = createTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    console.log(isSmallScreen)
    return (
        <Modal open={true}>
            <Box sx={{width: isSmallScreen ? '75%' : 500 ,backgroundColor:'white', padding: '40px', borderRadius:'5%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', boxShadow: 24, p: 4 }}>
                {props.children}
            </Box>
        </Modal>
    )
}