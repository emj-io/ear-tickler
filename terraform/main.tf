# Specify the provider and access details
provider "aws" {
  region = "${var.aws_region}"
}

# Create a VPC to launch our instances into
resource "aws_vpc" "vpc" {
  tags {
    environment = "${var.environment}"
    name = "${var.environment}-vpc"
  }
  cidr_block = "10.0.0.0/16"
}

# Create an internet gateway to give our subnet access to the outside world
resource "aws_internet_gateway" "internet_gateway" {
  tags {
    environment = "${var.environment}"
    name = "${var.environment}-igw"
  }
  vpc_id = "${aws_vpc.vpc.id}"
}

# Grant the VPC internet access on its main route table
resource "aws_route" "route" {
  route_table_id         = "${aws_vpc.vpc.main_route_table_id}"
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = "${aws_internet_gateway.internet_gateway.id}"
}

# Create a subnet to launch our instances into
resource "aws_subnet" "subnet" {
  tags {
    environment = "${var.environment}"
    name = "${var.environment}-subnet"
  }
  vpc_id                  = "${aws_vpc.vpc.id}"
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
}

# A security group for the ELB so it is accessible via the web
resource "aws_security_group" "sg_elb" {
  tags {
    environment = "${var.environment}"
    name = "${var.environment}-sg-elb"
  }
  description = "Used in the terraform"
  vpc_id      = "${aws_vpc.vpc.id}"

  # HTTP access from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Our default security group to access
# the instances over SSH and HTTP
resource "aws_security_group" "sg_instance" {
name        = "${var.environment}_sg_instance"
tags {
  environment = "${var.environment}"
}
            
description = "Used in the terraform"
  vpc_id      = "${aws_vpc.vpc.id}"

  # SSH access from anywhere
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access from the VPC
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_elb" "elb" {
  name = "${var.environment}-elb"
  tags {
    environment = "${var.environment}"
  }
            
  subnets         = ["${aws_subnet.subnet.id}"]
  security_groups = ["${aws_security_group.sg_elb.id}"]
  instances       = ["${aws_instance.instance.id}"]
  listener {
    instance_port     = 80
    instance_protocol = "http"
    lb_port           = 80
    lb_protocol       = "http"
  }
}

resource "aws_key_pair" "auth" {
  key_name   = "${var.key_name}"
  public_key = "${file(var.public_key_path)}"
}

resource "aws_instance" "instance" {
  tags {
    environment = "${var.environment}"
    Name = "${var.environment}-instance"
  }

  # The connection block tells our provisioner how to
  # communicate with the resource (instance)
#  connection {
#    # The default username for our AMI
#    user = "ubuntu"
#    # The connection will use the local SSH agent for authentication.
#  }

  instance_type = "t2.small"

# Lookup the correct AMI based on the region
  # we specified
  ami = "${lookup(var.aws_amis, var.aws_region)}"

  # The name of our SSH keypair we created above.
  key_name = "${aws_key_pair.auth.id}"

  # Our Security group to allow HTTP and SSH access
  vpc_security_group_ids = ["${aws_security_group.sg_instance.id}"]

  # We're going to launch into the same subnet as our ELB. In a production
  # environment it's more common to have a separate private subnet for
  # backend instances.
  subnet_id = "${aws_subnet.subnet.id}"

  # We run a remote provisioner on the instance after creating it.
  # In this case, we just install nginx and start it. By default,
  # this should be on port 80
#  provisioner "remote-exec" {
#    inline = [
#      "sudo apt-get -y update",
#      "sudo apt-get -y install nginx",
#      "sudo service nginx start"
#    ]
#  }
}
