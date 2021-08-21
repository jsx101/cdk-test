import * as cdk from "@aws-cdk/core";
import { Vpc } from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

export class FargateStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // VPC
        const vpc = new Vpc(this, "helloVpc", {
            maxAzs: 2,
            natGateways: 1
        });

        const cluster = new ecs.Cluster(this, "helloCluster", {
            vpc: vpc as any,
        });

        // Fargate service
        const helloService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "helloDarknessMyOldFriend", {
            cluster: cluster,
            memoryLimitMiB: 1024,
            cpu: 512,
            desiredCount: 2,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset("./haro/"),
                environment: {
                    myVar: "variable01",
                }
            }
        });

        // Health check
        helloService.targetGroup.configureHealthCheck({path: "/hello"});

        // Load balancer url
        new cdk.CfnOutput(this, "loadBalancedUrl", {
            value: helloService.loadBalancer.loadBalancerDnsName,
            exportName: "loadBalancerUrl",
        });
    }
}