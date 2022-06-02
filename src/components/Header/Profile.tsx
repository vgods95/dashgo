import { Box, Flex, Text, Avatar } from "@chakra-ui/react";

interface ProfileProps {
    showProfileData?: boolean;
}

export function Profile({ showProfileData = true }: ProfileProps) {
    return (
        <Flex align="center">
            {showProfileData && (
                <Box mr="4" textAlign="right">
                    <Text>Vinícius Godoy</Text>
                    <Text color="gray.300" fontSize="small">viniciusgodoyf@gmail.com</Text>
                </Box>
            )}
            
            <Avatar size="md" name="Vinícius Godoy" src="https://avatars.githubusercontent.com/u/52984507?v=4" />
        </Flex>
    );
}