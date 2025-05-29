import java.util.Scanner;

class Player {
    private static int X = 0;
    private static int Y = 1;
    private static int[][][] landPoints;
    private static int[] landingZoneRange;
    private static int targetX;
    private static int targetY;

    public static void main(String args[]) {

        landingZoneRange = new int[2];

        Scanner in = new Scanner(System.in);
        int n = in.nextInt(); // the number of landPoints used to draw the surface of Mars.
        landPoints = new int[n][2][2];
        for (int i = 0; i < n; i++) {
            // X coordinate of a surface point. (0 to 6999)
            int landX = in.nextInt();
            // Y coordinate of a surface point.
            // By linking all the landPoints together in a sequential fashion,
            // you form the surface of Mars.
            int landY = in.nextInt();
            if (i < n - 1) {
                landPoints[i] = new int[2][2];
                landPoints[i][0][X] = landX;
                landPoints[i][0][Y] = landY;
            }
            if (i > 0) {
                landPoints[i - 1][1][X] = landX;
                landPoints[i - 1][1][Y] = landY;
                if (landPoints[i - 1][0][Y] == landY) {
                    landingZoneRange[0] = landPoints[i - 1][0][X];
                    landingZoneRange[1] = landPoints[i - 1][1][X];
                    targetX = (landingZoneRange[0] + landingZoneRange[1]) / 2;
                    targetY = landY;
                }
            }
        }

        // game loop
        while (true) {
            int currX = in.nextInt();
            int currY = in.nextInt();
            int currHS = in.nextInt(); // the horizontal speed (in m/s), can be negative.
            int currVS = in.nextInt(); // the vertical speed (in m/s), can be negative.
            int fuel = in.nextInt(); // the quantity of remaining fuel in liters.
            int rotation = in.nextInt(); // the rotation angle in degrees (-90 to 90).
            int power = in.nextInt(); // the thrust power (0 to 4).

            int horizontalError = targetX - currX;
            if (horizontalError > 0 && currHS < 0) {

            }

            // Write an action using System.out.println()
            // To debug: System.err.println("Debug messages...");


            // R P. R is the desired rotation angle. P is the desired thrust power.
            System.out.println("-20 3");
        }
    }
}
